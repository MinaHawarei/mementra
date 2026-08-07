<?php

namespace App\Services\Storage;

interface MediaStorageInterface
{
    public function upload(string $path, string $contents, string $mimeType, ?string $folder = null): StorageResult;

    public function download(string $fileId): string;

    public function delete(string $fileId): bool;

    public function exists(string $fileId): bool;

    public function metadata(string $fileId): array;
}
