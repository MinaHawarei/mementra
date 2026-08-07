<?php

namespace App\Services\Storage;

readonly class StorageResult
{
    public function __construct(
        public string $fileId,
        public string $provider,
        public ?string $url = null,
        public ?array $metadata = null,
    ) {}
}
