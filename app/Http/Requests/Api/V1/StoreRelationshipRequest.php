<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\RelationshipStatus;
use App\Enums\RelationshipType;
use App\Models\Relationship;
use App\Models\User;
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

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $user = $this->user();
            if (! $user) {
                return;
            }

            $partnerEmail = $this->input('partner_email');
            if (empty($partnerEmail)) {
                return;
            }

            if (strtolower(trim($partnerEmail)) === strtolower(trim($user->email))) {
                $validator->errors()->add('partner_email', 'You cannot connect with your own email address.');

                return;
            }

            if ($user->activeRelationship()) {
                $validator->errors()->add('partner_email', 'You already have an active partner connection. You must disconnect before linking a new partner.');

                return;
            }

            $partner = User::where('email', $partnerEmail)->first();
            if (! $partner) {
                return;
            }

            if ($partner->activeRelationship()) {
                $validator->errors()->add('partner_email', 'This user is already connected with another partner.');

                return;
            }

            // Check for existing pending invitation between these two users
            $existingPending = Relationship::where('status', RelationshipStatus::Pending)
                ->whereHas('members', fn ($q) => $q->where('user_id', $user->id))
                ->whereHas('members', fn ($q) => $q->where('user_id', $partner->id))
                ->first();

            if ($existingPending) {
                if ($existingPending->created_by === $user->id) {
                    $validator->errors()->add('partner_email', 'You already have a pending invitation sent to this user.');
                } else {
                    $validator->errors()->add('partner_email', 'This user has already sent you a connection request. Please accept their invitation.');
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'partner_email.exists' => 'No Mementra account found with this email address. Please ask your partner to register for Mementra first.',
            'partner_email.required' => 'Please enter your partner\'s email address.',
            'partner_email.email' => 'Please provide a valid email address.',
        ];
    }
}
