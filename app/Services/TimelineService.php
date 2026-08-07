<?php

namespace App\Services;

use App\Enums\TimelineEventType;
use App\Models\JournalEntry;
use App\Models\TimelineEvent;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class TimelineService
{
    public function recordEvent(User $user, TimelineEventType $eventType, string $title, $eventDate = null, ?string $description = null, ?array $metadata = null, ?Model $eventable = null, ?int $relationshipId = null): TimelineEvent
    {
        return TimelineEvent::create([
            'user_id' => $user->id,
            'relationship_id' => $relationshipId,
            'event_type' => $eventType,
            'event_date' => $eventDate ?? now()->toDateString(),
            'title' => $title,
            'description' => $description,
            'metadata' => $metadata,
            'eventable_type' => $eventable ? get_class($eventable) : null,
            'eventable_id' => $eventable ? $eventable->getKey() : null,
        ]);
    }

    public function getUserTimeline(User $user): Collection
    {
        $relationshipIds = $user->relationships()->pluck('relationships.id');

        return TimelineEvent::with('eventable')
            ->where(function ($query) use ($user, $relationshipIds) {
                $query->where('user_id', $user->id)
                    ->orWhereIn('relationship_id', $relationshipIds);
            })
            ->orderByDesc('event_date')
            ->orderByDesc('created_at')
            ->get();
    }

    public function getUserTimelinePaginated(User $user, int $perPage = 20): LengthAwarePaginator
    {
        $relationshipIds = $user->relationships()->pluck('relationships.id');

        $paginator = TimelineEvent::with('eventable')
            ->where(function ($query) use ($user, $relationshipIds) {
                $query->where('user_id', $user->id)
                    ->orWhereIn('relationship_id', $relationshipIds);
            })
            ->orderByDesc('event_date')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        // Eager-load media on JournalEntry eventables for preview
        $journalEntries = $paginator->getCollection()
            ->filter(fn (TimelineEvent $event) => $event->eventable_type === JournalEntry::class && $event->eventable)
            ->pluck('eventable');

        if ($journalEntries->isNotEmpty()) {
            $journalEntries->each->load('media');
        }

        return $paginator;
    }
}
