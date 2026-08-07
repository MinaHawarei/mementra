<?php

namespace App\Policies;

use App\Models\Relationship;
use App\Models\User;

class RelationshipPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Relationship $relationship): bool
    {
        return $relationship->created_by === $user->id || $relationship->members()->where('user_id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Relationship $relationship): bool
    {
        return $this->view($user, $relationship);
    }

    public function delete(User $user, Relationship $relationship): bool
    {
        return $relationship->created_by === $user->id;
    }
}
