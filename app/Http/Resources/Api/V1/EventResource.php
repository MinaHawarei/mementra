<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'event_date' => $this->event_date?->toDateString(),
            'timezone' => $this->timezone,
            'recurrence' => $this->recurrence?->value ?? $this->recurrence,
            'relationship' => new RelationshipResource($this->whenLoaded('relationship')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
