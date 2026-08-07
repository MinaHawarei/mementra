<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreJournalEntryRequest;
use App\Http\Requests\Api\V1\UpdateJournalEntryRequest;
use App\Http\Resources\Api\V1\JournalEntryResource;
use App\Models\JournalEntry;
use App\Services\JournalEntryService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class JournalEntryController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected JournalEntryService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $entries = $request->user()
            ->journalEntries()
            ->with(['blocks', 'media'])
            ->orderByDesc('entry_date')
            ->paginate(15);

        return JournalEntryResource::collection($entries);
    }

    public function store(StoreJournalEntryRequest $request): JsonResponse
    {
        $entry = $this->service->createEntry($request->user(), $request->validated());

        return (new JournalEntryResource($entry))
            ->response()
            ->setStatusCode(217) // Created
            ->setStatusCode(201);
    }

    public function show(JournalEntry $journalEntry): JournalEntryResource
    {
        $this->authorize('view', $journalEntry);

        return new JournalEntryResource($journalEntry->load(['owner', 'blocks', 'media']));
    }

    public function update(UpdateJournalEntryRequest $request, JournalEntry $journalEntry): JournalEntryResource
    {
        $this->authorize('update', $journalEntry);

        $updated = $this->service->updateEntry($journalEntry, $request->validated());

        return new JournalEntryResource($updated);
    }

    public function destroy(JournalEntry $journalEntry): JsonResponse
    {
        $this->authorize('delete', $journalEntry);

        $this->service->deleteEntry($journalEntry);

        return response()->json(null, 204);
    }
}
