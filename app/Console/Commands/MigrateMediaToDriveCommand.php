<?php

namespace App\Console\Commands;

use App\Models\MemoryMedia;
use App\Models\User;
use App\Services\Storage\Providers\GoogleDriveProvider;
use App\Services\Storage\StorageResolver;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class MigrateMediaToDriveCommand extends Command
{
    protected $signature = 'mementra:media-migrate-to-drive
                            {--user= : Specific user ID to migrate}
                            {--dry-run : Report what would be migrated without transferring}
                            {--force : Run without confirmation}';

    protected $description = 'Migrate local media files to users personal connected Google Drive accounts';

    public function handle(StorageResolver $resolver): int
    {
        $userId = $this->option('user');
        $dryRun = (bool) $this->option('dry-run');

        $query = MemoryMedia::with(['owner.googleDriveConnection'])
            ->where('storage_provider', '!=', 'google_drive');

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $mediaItems = $query->get();

        if ($mediaItems->isEmpty()) {
            $this->info('No local media files found requiring migration.');

            return self::SUCCESS;
        }

        $this->info("Found {$mediaItems->count()} media items to process.");

        if ($dryRun) {
            $this->warn('DRY RUN MODE ENABLED — no files will be uploaded or modified.');
        } elseif (! $this->option('force') && ! $this->confirm('Proceed with migrating media to connected Google Drives?')) {
            $this->info('Migration cancelled.');

            return self::SUCCESS;
        }

        $migrated = 0;
        $skippedNoConnection = 0;
        $skippedFileNotFound = 0;
        $failed = 0;

        $bar = $this->output->createProgressBar($mediaItems->count());
        $bar->start();

        foreach ($mediaItems as $media) {
            $user = $media->owner;

            if (! $user || ! $user->googleDriveConnection) {
                $skippedNoConnection++;
                $bar->advance();

                continue;
            }

            // Check if source local file exists
            if (! Storage::disk('local')->exists($media->provider_file_id)) {
                $skippedFileNotFound++;
                $bar->advance();

                continue;
            }

            if ($dryRun) {
                $migrated++;
                $bar->advance();

                continue;
            }

            try {
                $provider = $resolver->resolveForConnection($user->googleDriveConnection);

                if (! ($provider instanceof GoogleDriveProvider)) {
                    $failed++;
                    $bar->advance();

                    continue;
                }

                $contents = Storage::disk('local')->get($media->provider_file_id);

                if (empty($contents)) {
                    $failed++;
                    $bar->advance();

                    continue;
                }

                // Upload to user's Google Drive
                $storedFile = $provider->upload($contents, [
                    'filename' => $media->original_filename,
                    'mime_type' => $media->mime_type,
                    'folder_type' => 'memories',
                    'memory_id' => $media->journal_entry_id,
                    'year' => $media->created_at?->format('Y') ?? date('Y'),
                    'width' => $media->width,
                    'height' => $media->height,
                ]);

                // Verify upload succeeded
                if (! $provider->exists($storedFile->fileId)) {
                    throw new Exception("Verification failed: file {$storedFile->fileId} not found in Google Drive.");
                }

                // Update database references only after verification
                $media->update([
                    'storage_connection_id' => $user->googleDriveConnection->id,
                    'storage_provider' => 'google_drive',
                    'provider_file_id' => $storedFile->fileId,
                    'metadata' => array_merge($media->metadata ?? [], [
                        'migrated_at' => now()->toIso8601String(),
                        'previous_provider' => $media->storage_provider,
                        'previous_file_id' => $media->provider_file_id,
                    ]),
                ]);

                $migrated++;
            } catch (Exception $e) {
                $this->error("\nFailed to migrate media #{$media->id}: ".$e->getMessage());
                $failed++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->table(
            ['Metric', 'Count'],
            [
                ['Total Items Considered', $mediaItems->count()],
                ['Migrated Successfully', $migrated],
                ['Skipped (Owner has no Google Drive)', $skippedNoConnection],
                ['Skipped (Local file missing)', $skippedFileNotFound],
                ['Failed', $failed],
            ]
        );

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }
}
