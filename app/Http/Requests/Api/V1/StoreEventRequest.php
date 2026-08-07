<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\Recurrence;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEventRequest extends FormRequest
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
            'event_date' => ['required', 'date'],
            'timezone' => ['nullable', 'string', 'max:64'],
            'recurrence' => ['nullable', Rule::enum(Recurrence::class)],
            'relationship_id' => ['nullable', 'exists:relationships,id'],
        ];
    }
}
