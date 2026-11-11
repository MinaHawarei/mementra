<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemoryMediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->id,
            'type' => $this->type?->value ?? $this->type,
            'storage_provider' => $this->storage_provider,
            'provider_file_id' => $this->provider_file_id,
            'original_filename' => $this->original_filename,
            'mime_type' => $this->mime_type,
            'size_bytes' => $this->size_bytes,
            'width' => $this->width,
            'height' => $this->height,
            'sort_order' => $this->sort_order,
            'url' => route('media.show', $this->id),
            'download_url' => route('media.download', $this->id),
            'is_owner' => $user ? $this->user_id === $user->id : false,
            'user_id' => $this->user_id,
            'journal_entry_id' => $this->journal_entry_id,
            'journal_entry' => $this->when(
                $this->relationLoaded('journalEntry') && $this->journalEntry,
                fn () => [
                    'id' => $this->journalEntry->id,
                    'title' => $this->journalEntry->title,
                    'entry_date' => $this->journalEntry->entry_date?->toDateString(),
                ]
            ),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
