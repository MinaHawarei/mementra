<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RelationshipResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type?->value ?? $this->type,
            'status' => $this->status?->value ?? $this->status,
            'anniversary_date' => $this->anniversary_date?->toDateString(),
            'connected_at' => $this->connected_at?->toIso8601String(),
            'ended_at' => $this->ended_at?->toIso8601String(),
            'members' => UserResource::collection($this->whenLoaded('members')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
