<?php

namespace App\Services;

use App\Enums\RelationshipRole;
use App\Enums\RelationshipStatus;
use App\Enums\RelationshipType;
use App\Models\Relationship;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RelationshipService
{
    public function initiateConnection(User $creator, User $partner, RelationshipType $type = RelationshipType::Couple, ?string $name = null): Relationship
    {
        return DB::transaction(function () use ($creator, $partner, $type, $name) {
            $relationship = Relationship::create([
                'name' => $name ?? "{$creator->name} & {$partner->name}",
                'type' => $type,
                'status' => RelationshipStatus::Pending,
                'created_by' => $creator->id,
            ]);

            $relationship->members()->attach($creator->id, [
                'role' => RelationshipRole::Creator->value,
                'joined_at' => now(),
            ]);

            $relationship->members()->attach($partner->id, [
                'role' => RelationshipRole::Partner->value,
                'joined_at' => now(),
            ]);

            return $relationship;
        });
    }

    public function acceptConnection(Relationship $relationship): bool
    {
        return $relationship->update([
            'status' => RelationshipStatus::Active,
            'connected_at' => now(),
        ]);
    }

    public function declineConnection(Relationship $relationship): bool
    {
        return $relationship->update([
            'status' => RelationshipStatus::Rejected,
        ]);
    }

    public function endRelationship(Relationship $relationship): bool
    {
        return DB::transaction(function () use ($relationship) {
            $updated = $relationship->update([
                'status' => RelationshipStatus::Ended,
                'ended_at' => now(),
            ]);

            // Revoke relationship-level shares
            $relationship->events()->update(['relationship_id' => null]);

            return $updated;
        });
    }
}
