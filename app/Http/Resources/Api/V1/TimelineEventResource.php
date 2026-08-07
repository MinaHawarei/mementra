<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TimelineEventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'event_type' => $this->event_type?->value ?? $this->event_type,
            'event_date' => $this->event_date?->toDateString(),
            'title' => $this->title,
            'description' => $this->description,
            'metadata' => $this->metadata,
            'eventable_type' => $this->eventable_type,
            'eventable_id' => $this->eventable_id,
            'media' => $this->when(
                $this->relationLoaded('eventable') && $this->eventable && method_exists($this->eventable, 'relationLoaded') && $this->eventable->relationLoaded('media'),
                fn () => MemoryMediaResource::collection($this->eventable->media)
            ),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
