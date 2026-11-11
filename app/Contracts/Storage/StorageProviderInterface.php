<?php

namespace App\Contracts\Storage;

use App\Services\Storage\DTOs\StoredFile;
use Illuminate\Http\UploadedFile;

interface StorageProviderInterface
{
    /**
     * Upload a file or binary content to the storage provider.
     *
     * @param  array<string, mixed>  $options
     */
    public function upload(UploadedFile|string $file, array $options = []): StoredFile;

    /**
     * Download file content as a string.
     */
    public function download(string $fileId): string;

    /**
     * Get a readable stream for the file.
     *
     * @return resource
     */
    public function stream(string $fileId);

    /**
     * Copy a file within this provider.
     *
     * @param  array<string, mixed>  $options
     */
    public function copy(string $fileId, array $options = []): StoredFile;

    /**
     * Delete a file from storage.
     */
    public function delete(string $fileId): bool;

    /**
     * Check if a file exists in storage.
     */
    public function exists(string $fileId): bool;

    /**
     * Retrieve file metadata.
     *
     * @return array<string, mixed>
     */
    public function getMetadata(string $fileId): array;

    /**
     * Get a temporary access URL if supported, or null.
     */
    public function getTemporaryAccessUrl(string $fileId, int $expirationMinutes = 5): ?string;
}
