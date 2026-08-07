<?php

namespace App\Policies;

use App\Models\MemoryMedia;
use App\Models\User;

class MemoryMediaPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, MemoryMedia $media): bool
    {
        if ($media->user_id === $user->id) {
            return true;
        }

        if ($media->journalEntry !== null) {
            return $user->can('view', $media->journalEntry);
        }

        return false;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function delete(User $user, MemoryMedia $media): bool
    {
        return $media->user_id === $user->id;
    }
}
