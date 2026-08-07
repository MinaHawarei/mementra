<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreReminderRequest;
use App\Http\Resources\Api\V1\ReminderResource;
use App\Models\Reminder;
use App\Services\ReminderService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReminderController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected ReminderService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $reminders = Reminder::where('user_id', $request->user()->id)
            ->orderBy('remind_at')
            ->get();

        return ReminderResource::collection($reminders);
    }

    public function store(StoreReminderRequest $request): JsonResponse
    {
        $reminder = $this->service->createReminder($request->user(), $request->validated());

        return (new ReminderResource($reminder))
            ->response()
            ->setStatusCode(201);
    }

    public function destroy(Reminder $reminder): JsonResponse
    {
        $this->authorize('delete', $reminder);

        $reminder->delete();

        return response()->json(null, 204);
    }
}
