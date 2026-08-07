<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\Mood;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateJournalEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'entry_date' => ['nullable', 'date'],
            'timezone' => ['nullable', 'string', 'max:64'],
            'location_name' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'mood' => ['nullable', Rule::enum(Mood::class)],
            'is_private' => ['nullable', 'boolean'],
            'blocks' => ['nullable', 'array'],
            'blocks.*.type' => ['required_with:blocks', 'string'],
            'blocks.*.content_json' => ['nullable', 'array'],
            'images' => ['nullable', 'array'],
            'images.*' => ['file', 'image', 'max:10240'],
        ];
    }
}
