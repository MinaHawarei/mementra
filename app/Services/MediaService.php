<?php

namespace App\Services;

use App\Enums\MediaType;
use App\Models\MemoryMedia;
use App\Models\User;
use App\Services\Storage\MediaStorageInterface;
use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class MediaService
{
    public function __construct(protected MediaStorageInterface $storage) {}

    public function uploadMedia(User $user, UploadedFile $file, ?int $journalEntryId = null): MemoryMedia
    {
        $mimeType = $file->getMimeType() ?? 'application/octet-stream';
        $contents = file_get_contents($file->getRealPath());

        $type = match (true) {
            str_starts_with($mimeType, 'image/') => MediaType::Photo,
            str_starts_with($mimeType, 'video/') => MediaType::Video,
            str_starts_with($mimeType, 'audio/') => MediaType::Audio,
            default => MediaType::Document,
        };

        $width = null;
        $height = null;
        if ($type === MediaType::Photo) {
            $imageSize = @getimagesize($file->getRealPath());
            if ($imageSize) {
                $width = $imageSize[0];
                $height = $imageSize[1];
            }
        }

        // Upload to storage provider first
        $storageResult = $this->storage->upload(
            path: $file->getClientOriginalName(),
            contents: $contents,
            mimeType: $mimeType,
            folder: "mementra/user-{$user->id}"
        );

        // Save DB record transactionally
        try {
            return DB::transaction(function () use ($user, $journalEntryId, $type, $storageResult, $file, $mimeType, $width, $height) {
                return MemoryMedia::create([
                    'user_id' => $user->id,
                    'journal_entry_id' => $journalEntryId,
                    'type' => $type,
                    'storage_provider' => $storageResult->provider,
                    'provider_file_id' => $storageResult->fileId,
                    'original_filename' => $file->getClientOriginalName(),
                    'mime_type' => $mimeType,
                    'size_bytes' => $file->getSize(),
                    'width' => $width,
                    'height' => $height,
                    'metadata' => $storageResult->metadata,
                ]);
            });
        } catch (Exception $e) {
            // Delete storage file if DB save fails to prevent orphan files
            $this->storage->delete($storageResult->fileId);
            throw $e;
        }
    }

    public function deleteMedia(MemoryMedia $media): bool
    {
        return DB::transaction(function () use ($media) {
            $this->storage->delete($media->provider_file_id);

            return $media->delete();
        });
    }

    public function getMediaContents(MemoryMedia $media): string
    {
        return $this->storage->download($media->provider_file_id);
    }
}
