<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JournalBlockResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type?->value ?? $this->type,
            'position' => $this->position,
            'content' => $this->content_json,
            'created_by' => $this->created_by,
            'creator' => new UserResource($this->whenLoaded('creator')),
        ];
    }
}
