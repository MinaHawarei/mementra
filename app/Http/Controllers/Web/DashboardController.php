<?php

namespace App\Http\Controllers\Web;

use App\Enums\RelationshipStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\EventResource;
use App\Http\Resources\Api\V1\JournalEntryResource;
use App\Http\Resources\Api\V1\RelationshipResource;
use App\Http\Resources\Api\V1\ReminderResource;
use App\Services\TimelineService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(protected TimelineService $timelineService) {}

    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $activeRelationship = $user->relationships()
            ->with(['members', 'creator'])
            ->where('status', RelationshipStatus::Active)
            ->first();

        $recentEntries = $user->journalEntries()
            ->with(['blocks', 'media'])
            ->orderByDesc('entry_date')
            ->take(5)
            ->get();

        $upcomingEvents = $user->events()
            ->where('event_date', '>=', now()->toDateString())
            ->orderBy('event_date')
            ->take(5)
            ->get();

        $upcomingReminders = $user->reminders()
            ->where('is_active', true)
            ->where('remind_at', '>=', now())
            ->orderBy('remind_at')
            ->take(5)
            ->get();

        return Inertia::render('dashboard', [
            'relationship' => $activeRelationship ? (new RelationshipResource($activeRelationship))->response()->getData(true)['data'] : null,
            'recentEntries' => JournalEntryResource::collection($recentEntries)->response()->getData(true)['data'],
            'upcomingEvents' => EventResource::collection($upcomingEvents)->response()->getData(true)['data'],
            'upcomingReminders' => ReminderResource::collection($upcomingReminders)->response()->getData(true)['data'],
        ]);
    }
}
