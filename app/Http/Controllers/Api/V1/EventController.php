<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\Recurrence;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreEventRequest;
use App\Http\Resources\Api\V1\EventResource;
use App\Models\Event;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EventController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): AnonymousResourceCollection
    {
        $events = Event::where('user_id', $request->user()->id)
            ->orderBy('event_date')
            ->get();

        return EventResource::collection($events);
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        $event = Event::create([
            'user_id' => $request->user()->id,
            'title' => $request->validated('title'),
            'description' => $request->validated('description'),
            'event_date' => $request->validated('event_date'),
            'timezone' => $request->validated('timezone') ?? $request->user()->timezone ?? 'UTC',
            'recurrence' => Recurrence::tryFrom($request->validated('recurrence') ?? '') ?? Recurrence::None,
            'relationship_id' => $request->validated('relationship_id'),
        ]);

        return (new EventResource($event))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Event $event): EventResource
    {
        $this->authorize('view', $event);

        return new EventResource($event);
    }

    public function destroy(Event $event): JsonResponse
    {
        $this->authorize('delete', $event);

        $event->delete();

        return response()->json(null, 204);
    }
}
