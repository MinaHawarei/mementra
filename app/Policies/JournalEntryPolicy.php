<?php

namespace App\Policies;

use App\Enums\SharePermission;
use App\Models\JournalEntry;
use App\Models\MemoryShare;
use App\Models\User;

class JournalEntryPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, JournalEntry $journalEntry): bool
    {
        if ($journalEntry->user_id === $user->id) {
            return true;
        }

        if ($journalEntry->contributors()->where('user_id', $user->id)->exists()) {
            return true;
        }

        if ($journalEntry->is_private) {
            return false;
        }

        return $this->hasActiveShare($user, $journalEntry);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, JournalEntry $journalEntry): bool
    {
        if ($journalEntry->user_id === $user->id) {
            return true;
        }

        if ($journalEntry->contributors()->where('user_id', $user->id)->exists()) {
            return true;
        }

        return $this->hasActiveShare($user, $journalEntry, SharePermission::Collaborate);
    }

    public function delete(User $user, JournalEntry $journalEntry): bool
    {
        return $journalEntry->user_id === $user->id;
    }

    private function hasActiveShare(User $user, JournalEntry $journalEntry, ?SharePermission $requiredPermission = null): bool
    {
        $relationshipIds = $user->relationships()->pluck('relationships.id');

        $query = MemoryShare::query()
            ->where('resource_type', 'journal_entry')
            ->where('resource_id', $journalEntry->id)
            ->where(function ($q) use ($user, $relationshipIds) {
                $q->where('target_user_id', $user->id)
                    ->orWhereIn('relationship_id', $relationshipIds);
            })
            ->whereNull('revoked_at')
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            });

        if ($requiredPermission !== null) {
            $query->where('permission', $requiredPermission->value);
        }

        return $query->exists();
    }
}
