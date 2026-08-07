<?php

namespace App\Http\Controllers\Web;

use App\Enums\Recurrence;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreEventRequest;
use App\Http\Resources\Api\V1\EventResource;
use App\Models\Event;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): Response
    {
        $events = Event::where('user_id', $request->user()->id)
            ->orderBy('event_date')
            ->get();

        return Inertia::render('events/index', [
            'events' => EventResource::collection($events)->resolve(),
        ]);
    }

    public function store(StoreEventRequest $request): RedirectResponse
    {
        Event::create([
            'user_id' => $request->user()->id,
            'title' => $request->validated('title'),
            'description' => $request->validated('description'),
            'event_date' => $request->validated('event_date'),
            'timezone' => $request->validated('timezone') ?? $request->user()->timezone ?? 'UTC',
            'recurrence' => Recurrence::tryFrom($request->validated('recurrence') ?? '') ?? Recurrence::None,
            'relationship_id' => $request->validated('relationship_id'),
        ]);

        return redirect()->route('events.index');
    }

    public function destroy(Event $event): RedirectResponse
    {
        $this->authorize('delete', $event);

        $event->delete();

        return redirect()->route('events.index');
    }
}
