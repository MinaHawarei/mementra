<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\RelationshipType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRelationshipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'partner_email' => ['required', 'email', 'exists:users,email'],
            'type' => ['nullable', Rule::enum(RelationshipType::class)],
            'name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
