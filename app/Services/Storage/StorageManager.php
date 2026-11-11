<?php

namespace App\Services\Storage;

use App\Models\MemoryMedia;
use App\Models\SavedMedia;
use App\Models\User;
use App\Services\Storage\DTOs\StoredFile;
use App\Services\Storage\Providers\GoogleDriveProvider;
use Exception;
use Illuminate\Http\UploadedFile;

class StorageManager
{
    public function __construct(protected StorageResolver $resolver) {}

    public function getResolver(): StorageResolver
    {
        return $this->resolver;
    }

    public function uploadForUser(User $user, UploadedFile $file, array $options = []): StoredFile
    {
        $provider = $this->resolver->resolveForUser($user);

        return $provider->upload($file, $options);
    }

    public function downloadMedia(MemoryMedia $media): string
    {
        $provider = $this->resolver->resolveForMedia($media);

        return $provider->download($media->provider_file_id);
    }

    public function streamMedia(MemoryMedia $media)
    {
        $provider = $this->resolver->resolveForMedia($media);

        return $provider->stream($media->provider_file_id);
    }

    public function downloadSavedMedia(SavedMedia $savedMedia): string
    {
        $provider = $this->resolver->resolveForSavedMedia($savedMedia);

        return $provider->download($savedMedia->provider_file_id);
    }

    public function streamSavedMedia(SavedMedia $savedMedia)
    {
        $provider = $this->resolver->resolveForSavedMedia($savedMedia);

        return $provider->stream($savedMedia->provider_file_id);
    }

    public function deleteMedia(MemoryMedia $media): bool
    {
        $provider = $this->resolver->resolveForMedia($media);

        return $provider->delete($media->provider_file_id);
    }

    public function deleteSavedMedia(SavedMedia $savedMedia): bool
    {
        $provider = $this->resolver->resolveForSavedMedia($savedMedia);

        return $provider->delete($savedMedia->provider_file_id);
    }

    /**
     * Copy media across different user accounts.
     * Streams from original owner's storage and uploads to destination user's storage.
     */
    public function copyMediaAcrossUsers(User $destinationUser, MemoryMedia $sourceMedia): StoredFile
    {
        $destinationProvider = $this->resolver->resolveForUser($destinationUser);

        if (! ($destinationProvider instanceof GoogleDriveProvider)) {
            throw new Exception('Destination user must have an active Google Drive connection to save copies to their Drive.');
        }

        // 1. Download file content from source owner's storage
        $sourceProvider = $this->resolver->resolveForMedia($sourceMedia);
        $contents = $sourceProvider->download($sourceMedia->provider_file_id);

        if (empty($contents)) {
            throw new Exception('Failed to retrieve original file content from source storage.');
        }

        // 2. Upload independent copy into destination user's Google Drive
        return $destinationProvider->upload($contents, [
            'filename' => $sourceMedia->original_filename,
            'mime_type' => $sourceMedia->mime_type,
            'folder_type' => 'saved',
            'width' => $sourceMedia->width,
            'height' => $sourceMedia->height,
        ]);
    }
}
