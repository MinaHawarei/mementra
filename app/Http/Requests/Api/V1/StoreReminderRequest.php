<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\Recurrence;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReminderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'remind_at' => ['required', 'date'],
            'recurrence' => ['nullable', Rule::enum(Recurrence::class)],
            'relationship_id' => ['nullable', 'exists:relationships,id'],
            'remindable_type' => ['nullable', 'string'],
            'remindable_id' => ['nullable', 'integer'],
        ];
    }
}
