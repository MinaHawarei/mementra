<?php

namespace App\Policies;

use App\Models\MemoryShare;
use App\Models\User;

class MemorySharePolicy
{
    public function view(User $user, MemoryShare $share): bool
    {
        return $share->owner_id === $user->id || $share->target_user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function delete(User $user, MemoryShare $share): bool
    {
        return $share->owner_id === $user->id;
    }
}
