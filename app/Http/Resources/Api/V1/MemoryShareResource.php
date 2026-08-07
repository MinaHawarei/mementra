<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemoryShareResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'resource_type' => $this->resource_type,
            'resource_id' => $this->resource_id,
            'permission' => $this->permission?->value ?? $this->permission,
            'starts_at' => $this->starts_at?->toIso8601String(),
            'ends_at' => $this->ends_at?->toIso8601String(),
            'revoked_at' => $this->revoked_at?->toIso8601String(),
            'is_valid' => $this->isValid(),
            'target_user' => new UserResource($this->whenLoaded('targetUser')),
            'relationship' => new RelationshipResource($this->whenLoaded('relationship')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
