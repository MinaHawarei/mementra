<?php

namespace App\Services\Storage\Providers;

use App\Contracts\Storage\StorageProviderInterface;
use App\Services\Storage\DTOs\StoredFile;
use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LocalStorageProvider implements StorageProviderInterface
{
    public function __construct(protected string $disk = 'local') {}

    public function upload(UploadedFile|string $file, array $options = []): StoredFile
    {
        $folder = $options['folder'] ?? 'mementra/general';
        $folder = trim($folder, '/');

        if ($file instanceof UploadedFile) {
            $originalName = $options['filename'] ?? $file->getClientOriginalName();
            $mimeType = $options['mime_type'] ?? $file->getMimeType() ?? 'application/octet-stream';
            $sizeBytes = $file->getSize();
            $contents = file_get_contents($file->getRealPath());

            $width = null;
            $height = null;
            if (str_starts_with($mimeType, 'image/')) {
                $imageSize = @getimagesize($file->getRealPath());
                if ($imageSize) {
                    $width = $imageSize[0];
                    $height = $imageSize[1];
                }
            }
        } else {
            $contents = $file;
            $originalName = $options['filename'] ?? 'file_'.Str::random(10).'.bin';
            $mimeType = $options['mime_type'] ?? 'application/octet-stream';
            $sizeBytes = strlen($contents);
            $width = $options['width'] ?? null;
            $height = $options['height'] ?? null;

            if ($width === null && str_starts_with($mimeType, 'image/')) {
                $imageSize = @getimagesizefromstring($contents);
                if ($imageSize) {
                    $width = $imageSize[0];
                    $height = $imageSize[1];
                }
            }
        }

        $safeName = Str::uuid().'_'.preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $originalName);
        $targetPath = $folder ? "{$folder}/{$safeName}" : $safeName;

        Storage::disk($this->disk)->put($targetPath, $contents);

        return new StoredFile(
            fileId: $targetPath,
            provider: 'local',
            originalFilename: $originalName,
            mimeType: $mimeType,
            sizeBytes: $sizeBytes,
            width: $width,
            height: $height,
            url: null,
            metadata: [
                'disk' => $this->disk,
                'path' => $targetPath,
            ]
        );
    }

    public function download(string $fileId): string
    {
        $content = Storage::disk($this->disk)->get($fileId);

        if ($content === null) {
            throw new Exception("File not found on local disk: {$fileId}");
        }

        return $content;
    }

    public function stream(string $fileId)
    {
        $stream = Storage::disk($this->disk)->readStream($fileId);

        if ($stream === null) {
            throw new Exception("Unable to open read stream for file: {$fileId}");
        }

        return $stream;
    }

    public function copy(string $fileId, array $options = []): StoredFile
    {
        if (! $this->exists($fileId)) {
            throw new Exception("Source file does not exist: {$fileId}");
        }

        $folder = $options['folder'] ?? dirname($fileId);
        $folder = trim($folder, '/');
        $originalFilename = $options['filename'] ?? basename($fileId);

        $safeName = Str::uuid().'_'.preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $originalFilename);
        $destinationPath = $folder ? "{$folder}/{$safeName}" : $safeName;

        Storage::disk($this->disk)->copy($fileId, $destinationPath);

        $size = Storage::disk($this->disk)->size($destinationPath);
        $mimeType = Storage::disk($this->disk)->mimeType($destinationPath) ?: 'application/octet-stream';

        return new StoredFile(
            fileId: $destinationPath,
            provider: 'local',
            originalFilename: $originalFilename,
            mimeType: $mimeType,
            sizeBytes: $size,
            metadata: [
                'disk' => $this->disk,
                'path' => $destinationPath,
            ]
        );
    }

    public function delete(string $fileId): bool
    {
        return Storage::disk($this->disk)->delete($fileId);
    }

    public function exists(string $fileId): bool
    {
        return Storage::disk($this->disk)->exists($fileId);
    }

    public function getMetadata(string $fileId): array
    {
        if (! $this->exists($fileId)) {
            return [];
        }

        return [
            'file_id' => $fileId,
            'size_bytes' => Storage::disk($this->disk)->size($fileId),
            'last_modified' => Storage::disk($this->disk)->lastModified($fileId),
            'mime_type' => Storage::disk($this->disk)->mimeType($fileId),
        ];
    }

    public function getTemporaryAccessUrl(string $fileId, int $expirationMinutes = 5): ?string
    {
        return null;
    }
}
