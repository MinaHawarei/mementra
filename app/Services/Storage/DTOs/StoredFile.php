<?php

namespace App\Services\Storage\DTOs;

readonly class StoredFile
{
    /**
     * @param  array<string, mixed>|null  $metadata
     */
    public function __construct(
        public string $fileId,
        public string $provider,
        public string $originalFilename,
        public string $mimeType,
        public int $sizeBytes,
        public ?int $width = null,
        public ?int $height = null,
        public ?string $url = null,
        public ?array $metadata = null,
    ) {}
}
