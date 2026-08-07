<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JournalEntryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'entry_date' => $this->entry_date?->toDateString(),
            'timezone' => $this->timezone,
            'location_name' => $this->location_name,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'mood' => $this->mood?->value ?? $this->mood,
            'is_private' => $this->is_private,
            'status' => $this->status,
            'owner' => new UserResource($this->whenLoaded('owner')),
            'blocks' => JournalBlockResource::collection($this->whenLoaded('blocks')),
            'media' => MemoryMediaResource::collection($this->whenLoaded('media')),
            'reminders' => ReminderResource::collection($this->whenLoaded('reminders')),
            'shares' => MemoryShareResource::collection($this->whenLoaded('shares')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
