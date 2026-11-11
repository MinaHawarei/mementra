<?php

namespace App\Services\Storage;

use App\Contracts\Storage\StorageProviderInterface;
use App\Models\MemoryMedia;
use App\Models\SavedMedia;
use App\Models\StorageConnection;
use App\Models\User;
use App\Services\Storage\Providers\GoogleDriveProvider;
use App\Services\Storage\Providers\LocalStorageProvider;

class StorageResolver
{
    public function resolveForConnection(StorageConnection $connection): StorageProviderInterface
    {
        if ($connection->provider === 'google_drive' && $connection->isConnected()) {
            return new GoogleDriveProvider($connection);
        }

        return new LocalStorageProvider;
    }

    public function resolveForUser(User $user): StorageProviderInterface
    {
        $connection = $user->googleDriveConnection;

        if ($connection) {
            return new GoogleDriveProvider($connection);
        }

        return new LocalStorageProvider;
    }

    public function resolveForMedia(MemoryMedia $media): StorageProviderInterface
    {
        if ($media->storage_connection_id && $media->storageConnection) {
            return $this->resolveForConnection($media->storageConnection);
        }

        // Backward compatibility: If no connection ID but provider is google_drive,
        // check if original owner has an active Google Drive connection
        if ($media->storage_provider === 'google_drive' && $media->owner) {
            $connection = $media->owner->googleDriveConnection;
            if ($connection) {
                return new GoogleDriveProvider($connection);
            }
        }

        return new LocalStorageProvider;
    }

    public function resolveForSavedMedia(SavedMedia $savedMedia): StorageProviderInterface
    {
        if ($savedMedia->storage_connection_id && $savedMedia->storageConnection) {
            return $this->resolveForConnection($savedMedia->storageConnection);
        }

        if ($savedMedia->provider === 'google_drive' && $savedMedia->user) {
            $connection = $savedMedia->user->googleDriveConnection;
            if ($connection) {
                return new GoogleDriveProvider($connection);
            }
        }

        return new LocalStorageProvider;
    }
}
