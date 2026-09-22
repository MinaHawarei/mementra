<?php

namespace App\Http\Controllers\Web;

use App\Enums\Recurrence;
use App\Enums\TimelineEventType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreJournalEntryRequest;
use App\Http\Requests\Api\V1\UpdateJournalEntryRequest;
use App\Http\Resources\Api\V1\JournalEntryResource;
use App\Models\JournalEntry;
use App\Services\JournalEntryService;
use App\Services\ReminderService;
use App\Services\TimelineService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JournalController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected JournalEntryService $service,
        protected TimelineService $timelineService
    ) {}

    public function index(Request $request): Response
    {
        $entries = $request->user()
            ->journalEntries()
            ->with(['blocks', 'media'])
            ->orderByDesc('entry_date')
            ->paginate(12);

        return Inertia::render('journal/index', [
            'entries' => JournalEntryResource::collection($entries),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('journal/create');
    }

    public function store(StoreJournalEntryRequest $request): RedirectResponse
    {
        $entry = $this->service->createEntry($request->user(), $request->validated());

        $this->timelineService->recordEvent(
            $request->user(),
            TimelineEventType::JournalEntryCreated,
            $entry->title,
            $entry->entry_date,
            null,
            null,
            $entry
        );

        return redirect()->route('journal.show', $entry->id);
    }

    public function show(Request $request, JournalEntry $journal): Response
    {
        $this->authorize('view', $journal);

        $relationship = $request->user()->activeRelationship();
        $partner = $relationship?->partnerFor($request->user());

        $journal->load(['owner', 'blocks', 'media', 'shares.targetUser', 'shares.relationship', 'reminders']);
        $entry = (new JournalEntryResource($journal))->resolve();

        foreach (['blocks', 'media', 'reminders', 'shares'] as $key) {
            if (isset($entry[$key]['data'])) {
                $entry[$key] = $entry[$key]['data'];
            }
        }

        return Inertia::render('journal/show', [
            'entry' => $entry,
            'partner' => $partner ? ['id' => $partner->id, 'name' => $partner->name] : null,
        ]);
    }

    public function rememberThis(Request $request, JournalEntry $journal): RedirectResponse
    {
        $this->authorize('view', $journal);

        $validated = $request->validate([
            'remind_at' => ['required', 'date'],
            'recurrence' => ['nullable', 'string'],
        ]);

        app(ReminderService::class)->createReminder($request->user(), [
            'title' => 'Remember: '.$journal->title,
            'description' => 'Memory reminder for entry #'.$journal->id,
            'remind_at' => $validated['remind_at'],
            'recurrence' => $validated['recurrence'] ?? Recurrence::Yearly->value,
            'remindable_type' => get_class($journal),
            'remindable_id' => $journal->id,
        ]);

        return redirect()->route('journal.show', $journal->id);
    }

    public function edit(JournalEntry $journal): Response
    {
        $this->authorize('update', $journal);

        $journal->load(['blocks', 'media']);

        $entry = (new JournalEntryResource($journal))->resolve();

        // ResourceCollection wraps relations under a "data" key when resolved
        // outside a real HTTP response. Normalize to plain arrays for Inertia.
        if (isset($entry['blocks']['data'])) {
            $entry['blocks'] = $entry['blocks']['data'];
        }
        if (isset($entry['media']['data'])) {
            $entry['media'] = $entry['media']['data'];
        }

        return Inertia::render('journal/edit', ['entry' => $entry]);
    }

    public function update(UpdateJournalEntryRequest $request, JournalEntry $journal): RedirectResponse
    {
        $this->authorize('update', $journal);

        $this->service->updateEntry($journal, $request->validated());

        return redirect()->route('journal.show', $journal->id);
    }

    public function destroy(JournalEntry $journal): RedirectResponse
    {
        $this->authorize('delete', $journal);

        $this->service->deleteEntry($journal);

        return redirect()->route('journal.index');
    }
}
