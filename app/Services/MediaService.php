<?php

namespace App\Services;

use App\Enums\MediaType;
use App\Models\MemoryMedia;
use App\Models\SavedMedia;
use App\Models\User;
use App\Services\Storage\MediaStorageInterface;
use App\Services\Storage\StorageManager;
use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class MediaService
{
    protected StorageManager $storageManager;

    public function __construct(StorageManager|MediaStorageInterface|null $storage = null)
    {
        if ($storage instanceof StorageManager) {
            $this->storageManager = $storage;
        } else {
            $this->storageManager = app(StorageManager::class);
        }
    }

    public function uploadMedia(User $user, UploadedFile $file, ?int $journalEntryId = null, array $options = []): MemoryMedia
    {
        $mimeType = $file->getMimeType() ?? 'application/octet-stream';

        $type = match (true) {
            str_starts_with($mimeType, 'image/') => MediaType::Photo,
            str_starts_with($mimeType, 'video/') => MediaType::Video,
            str_starts_with($mimeType, 'audio/') => MediaType::Audio,
            default => MediaType::Document,
        };

        $uploadOptions = array_merge([
            'folder' => "mementra/user-{$user->id}",
            'folder_type' => 'memories',
            'year' => date('Y'),
            'memory_id' => $journalEntryId,
            'filename' => $file->getClientOriginalName(),
            'mime_type' => $mimeType,
        ], $options);

        // Upload to storage provider first
        $storedFile = $this->storageManager->uploadForUser($user, $file, $uploadOptions);

        $connectionId = $storedFile->metadata['connection_id'] ?? null;

        // Save DB record transactionally
        try {
            return DB::transaction(function () use ($user, $journalEntryId, $connectionId, $type, $storedFile) {
                return MemoryMedia::create([
                    'user_id' => $user->id,
                    'journal_entry_id' => $journalEntryId,
                    'storage_connection_id' => $connectionId,
                    'type' => $type,
                    'storage_provider' => $storedFile->provider,
                    'provider_file_id' => $storedFile->fileId,
                    'original_filename' => $storedFile->originalFilename,
                    'mime_type' => $storedFile->mimeType,
                    'size_bytes' => $storedFile->sizeBytes,
                    'width' => $storedFile->width,
                    'height' => $storedFile->height,
                    'metadata' => $storedFile->metadata,
                ]);
            });
        } catch (Exception $e) {
            // Delete storage file if DB save fails to prevent orphan files
            try {
                $this->storageManager->getResolver()->resolveForUser($user)->delete($storedFile->fileId);
            } catch (Exception) {
                // Ignore delete error during rollback
            }

            throw $e;
        }
    }

    public function deleteMedia(MemoryMedia $media): bool
    {
        return DB::transaction(function () use ($media) {
            try {
                $this->storageManager->deleteMedia($media);
            } catch (Exception) {
                // If file is already gone from remote storage, continue to delete DB record
            }

            return (bool) $media->delete();
        });
    }

    public function getMediaContents(MemoryMedia $media): string
    {
        return $this->storageManager->downloadMedia($media);
    }

    public function getMediaStream(MemoryMedia $media)
    {
        return $this->storageManager->streamMedia($media);
    }

    public function getSavedMediaContents(SavedMedia $savedMedia): string
    {
        return $this->storageManager->downloadSavedMedia($savedMedia);
    }

    public function getSavedMediaStream(SavedMedia $savedMedia)
    {
        return $this->storageManager->streamSavedMedia($savedMedia);
    }

    public function saveMediaToUserDrive(User $user, MemoryMedia $media): SavedMedia
    {
        // 1. Prevent duplicate saves
        $existing = SavedMedia::where('user_id', $user->id)
            ->where('original_media_id', $media->id)
            ->first();

        if ($existing) {
            return $existing;
        }

        // 2. Perform cross-account physical copy
        $storedFile = $this->storageManager->copyMediaAcrossUsers($user, $media);

        $connectionId = $storedFile->metadata['connection_id'] ?? null;

        // 3. Persist record in saved_media table
        return DB::transaction(function () use ($user, $media, $connectionId, $storedFile) {
            return SavedMedia::create([
                'user_id' => $user->id,
                'original_media_id' => $media->id,
                'original_owner_id' => $media->user_id,
                'storage_connection_id' => $connectionId,
                'provider' => $storedFile->provider,
                'provider_file_id' => $storedFile->fileId,
                'original_filename' => $storedFile->originalFilename,
                'mime_type' => $storedFile->mimeType,
                'size_bytes' => $storedFile->sizeBytes,
                'metadata' => $storedFile->metadata,
                'saved_at' => now(),
            ]);
        });
    }
}
