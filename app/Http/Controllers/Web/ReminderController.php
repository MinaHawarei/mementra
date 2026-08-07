<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreReminderRequest;
use App\Http\Resources\Api\V1\ReminderResource;
use App\Models\Reminder;
use App\Services\ReminderService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReminderController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected ReminderService $service) {}

    public function index(Request $request): Response
    {
        $reminders = Reminder::where('user_id', $request->user()->id)
            ->orderBy('remind_at')
            ->get();

        return Inertia::render('reminders/index', [
            'reminders' => ReminderResource::collection($reminders)->resolve(),
        ]);
    }

    public function store(StoreReminderRequest $request): RedirectResponse
    {
        $this->service->createReminder($request->user(), $request->validated());

        return redirect()->route('reminders.index');
    }

    public function destroy(Reminder $reminder): RedirectResponse
    {
        $this->authorize('delete', $reminder);

        $reminder->delete();

        return redirect()->route('reminders.index');
    }
}
