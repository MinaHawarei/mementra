<?php

namespace App\Services\Storage;

use Illuminate\Support\Facades\Storage;

class LocalTestMediaStorage implements MediaStorageInterface
{
    protected string $disk = 'local';

    public function upload(string $path, string $contents, string $mimeType, ?string $folder = null): StorageResult
    {
        $targetPath = $folder ? trim($folder, '/').'/'.ltrim($path, '/') : $path;

        Storage::disk($this->disk)->put($targetPath, $contents);

        return new StorageResult(
            fileId: $targetPath,
            provider: 'local_test',
            url: null,
            metadata: [
                'mime_type' => $mimeType,
                'size_bytes' => strlen($contents),
            ]
        );
    }

    public function download(string $fileId): string
    {
        return Storage::disk($this->disk)->get($fileId) ?? '';
    }

    public function delete(string $fileId): bool
    {
        return Storage::disk($this->disk)->delete($fileId);
    }

    public function exists(string $fileId): bool
    {
        return Storage::disk($this->disk)->exists($fileId);
    }

    public function metadata(string $fileId): array
    {
        if (! $this->exists($fileId)) {
            return [];
        }

        return [
            'file_id' => $fileId,
            'size_bytes' => Storage::disk($this->disk)->size($fileId),
            'last_modified' => Storage::disk($this->disk)->lastModified($fileId),
        ];
    }
}
