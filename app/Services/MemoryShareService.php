<?php

namespace App\Services;

use App\Enums\SharePermission;
use App\Models\JournalEntry;
use App\Models\MemoryShare;
use App\Models\Relationship;
use App\Models\User;
use Carbon\Carbon;

class MemoryShareService
{
    public function shareWithUser(User $owner, JournalEntry $entry, User $targetUser, SharePermission $permission = SharePermission::View, ?Carbon $startsAt = null, ?Carbon $endsAt = null): MemoryShare
    {
        return MemoryShare::create([
            'resource_type' => 'journal_entry',
            'resource_id' => $entry->id,
            'owner_id' => $owner->id,
            'target_user_id' => $targetUser->id,
            'relationship_id' => null,
            'permission' => $permission,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
        ]);
    }

    public function shareWithRelationship(User $owner, JournalEntry $entry, Relationship $relationship, SharePermission $permission = SharePermission::View, ?Carbon $startsAt = null, ?Carbon $endsAt = null): MemoryShare
    {
        return MemoryShare::create([
            'resource_type' => 'journal_entry',
            'resource_id' => $entry->id,
            'owner_id' => $owner->id,
            'target_user_id' => null,
            'relationship_id' => $relationship->id,
            'permission' => $permission,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
        ]);
    }

    public function revokeShare(MemoryShare $share): bool
    {
        return $share->update(['revoked_at' => now()]);
    }
}
