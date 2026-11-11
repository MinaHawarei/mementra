<?php

namespace App\Services;

use App\Enums\RelationshipRole;
use App\Enums\RelationshipStatus;
use App\Enums\RelationshipType;
use App\Enums\TimelineEventType;
use App\Models\Relationship;
use App\Models\User;
use App\Notifications\PartnerInvitationAcceptedNotification;
use App\Notifications\PartnerInvitationNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Throwable;

class RelationshipService
{
    public function __construct(protected ?TimelineService $timelineService = null)
    {
        $this->timelineService = $timelineService ?? app(TimelineService::class);
    }

    public function initiateConnection(User $creator, User $partner, RelationshipType $type = RelationshipType::Couple, ?string $name = null): Relationship
    {
        if ($creator->id === $partner->id) {
            throw ValidationException::withMessages([
                'partner_email' => 'You cannot connect with your own email address.',
            ]);
        }

        if ($creator->activeRelationship()) {
            throw ValidationException::withMessages([
                'partner_email' => 'You already have an active partner connection.',
            ]);
        }

        if ($partner->activeRelationship()) {
            throw ValidationException::withMessages([
                'partner_email' => 'This user is already connected in an active partnership.',
            ]);
        }

        return DB::transaction(function () use ($creator, $partner, $type, $name) {
            $existing = Relationship::where('status', RelationshipStatus::Pending)
                ->whereHas('members', fn ($q) => $q->where('user_id', $creator->id))
                ->whereHas('members', fn ($q) => $q->where('user_id', $partner->id))
                ->lockForUpdate()
                ->first();

            if ($existing) {
                return $existing;
            }

            $relationship = Relationship::create([
                'name' => $name ?: "{$creator->name} & {$partner->name}",
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

            try {
                $partner->notify(new PartnerInvitationNotification($relationship, $creator));
            } catch (Throwable $e) {
                Log::warning('Partner invitation notification could not be sent: '.$e->getMessage());
            }

            return $relationship;
        });
    }

    public function acceptConnection(Relationship $relationship, ?User $acceptor = null): bool
    {
        if ($relationship->status !== RelationshipStatus::Pending) {
            return false;
        }

        return DB::transaction(function () use ($relationship) {
            $updated = $relationship->update([
                'status' => RelationshipStatus::Active,
                'connected_at' => now(),
            ]);

            $members = $relationship->members()->get();
            $creator = $relationship->creator ?? $members->firstWhere('id', $relationship->created_by);
            $partner = $members->firstWhere('id', '!=', $relationship->created_by);

            // Record timeline events for both partners
            if ($creator) {
                $this->timelineService->recordEvent(
                    $creator,
                    TimelineEventType::RelationshipStarted,
                    "Connected with {$partner?->name}",
                    now()->toDateString(),
                    'Started your shared journey together on Mementra.',
                    ['partner_id' => $partner?->id],
                    $relationship,
                    $relationship->id
                );
            }

            if ($partner) {
                $this->timelineService->recordEvent(
                    $partner,
                    TimelineEventType::RelationshipStarted,
                    "Connected with {$creator?->name}",
                    now()->toDateString(),
                    'Started your shared journey together on Mementra.',
                    ['partner_id' => $creator?->id],
                    $relationship,
                    $relationship->id
                );
            }

            // Notify the creator that their partner accepted
            if ($creator && $partner) {
                try {
                    $creator->notify(new PartnerInvitationAcceptedNotification($relationship, $partner));
                } catch (Throwable $e) {
                    Log::warning('Partner acceptance notification could not be sent: '.$e->getMessage());
                }
            }

            // Cancel any other pending invitations for both members
            foreach ($members as $member) {
                Relationship::where('status', RelationshipStatus::Pending)
                    ->where('id', '!=', $relationship->id)
                    ->whereHas('members', fn ($q) => $q->where('user_id', $member->id))
                    ->update([
                        'status' => RelationshipStatus::Cancelled,
                        'ended_at' => now(),
                    ]);
            }

            return $updated;
        });
    }

    public function declineConnection(Relationship $relationship): bool
    {
        if ($relationship->status !== RelationshipStatus::Pending) {
            return false;
        }

        return $relationship->update([
            'status' => RelationshipStatus::Rejected,
            'ended_at' => now(),
        ]);
    }

    public function cancelConnection(Relationship $relationship): bool
    {
        if ($relationship->status !== RelationshipStatus::Pending) {
            return false;
        }

        return $relationship->update([
            'status' => RelationshipStatus::Cancelled,
            'ended_at' => now(),
        ]);
    }

    public function endRelationship(Relationship $relationship): bool
    {
        if ($relationship->status !== RelationshipStatus::Active) {
            return false;
        }

        return DB::transaction(function () use ($relationship) {
            $updated = $relationship->update([
                'status' => RelationshipStatus::Ended,
                'ended_at' => now(),
            ]);

            $members = $relationship->members()->get();
            foreach ($members as $member) {
                $other = $members->firstWhere('id', '!=', $member->id);
                $this->timelineService->recordEvent(
                    $member,
                    TimelineEventType::RelationshipEnded,
                    "Ended connection with {$other?->name}",
                    now()->toDateString(),
                    'Your personal memories, journal entries, and Google Drive photos remain safely preserved in your account.',
                    ['former_partner_id' => $other?->id],
                    $relationship,
                    $relationship->id
                );
            }

            // Unlink relationship-level events (personal events remain intact)
            $relationship->events()->update(['relationship_id' => null]);

            return $updated;
        });
    }
}
