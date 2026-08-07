<?php

namespace App\Policies;

use App\Models\Reminder;
use App\Models\User;

class ReminderPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Reminder $reminder): bool
    {
        if ($reminder->user_id === $user->id) {
            return true;
        }

        if ($reminder->relationship_id !== null) {
            return $user->relationships()->where('relationships.id', $reminder->relationship_id)->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Reminder $reminder): bool
    {
        return $reminder->user_id === $user->id;
    }

    public function delete(User $user, Reminder $reminder): bool
    {
        return $reminder->user_id === $user->id;
    }
}
