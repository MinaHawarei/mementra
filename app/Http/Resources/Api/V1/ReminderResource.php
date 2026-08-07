<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReminderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'remind_at' => $this->remind_at?->toIso8601String(),
            'recurrence' => $this->recurrence?->value ?? $this->recurrence,
            'is_active' => $this->is_active,
            'last_triggered_at' => $this->last_triggered_at?->toIso8601String(),
            'remindable_type' => $this->remindable_type,
            'remindable_id' => $this->remindable_id,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
