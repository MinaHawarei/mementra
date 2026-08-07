<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\SharePermission;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMemoryShareRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'target_user_id' => ['required_without:relationship_id', 'nullable', 'exists:users,id'],
            'relationship_id' => ['required_without:target_user_id', 'nullable', 'exists:relationships,id'],
            'permission' => ['nullable', Rule::enum(SharePermission::class)],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ];
    }
}
