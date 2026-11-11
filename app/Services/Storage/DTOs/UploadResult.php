<?php

namespace App\Services\Storage\DTOs;

readonly class UploadResult
{
    /**
     * @param  array<string, mixed>|null  $metadata
     */
    public function __construct(
        public string $fileId,
        public string $provider,
        public ?string $url = null,
        public ?array $metadata = null,
    ) {}

    public static function fromStoredFile(StoredFile $storedFile): self
    {
        return new self(
            fileId: $storedFile->fileId,
            provider: $storedFile->provider,
            url: $storedFile->url,
            metadata: $storedFile->metadata,
        );
    }
}
