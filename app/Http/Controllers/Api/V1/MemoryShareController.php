<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\SharePermission;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreMemoryShareRequest;
use App\Http\Resources\Api\V1\MemoryShareResource;
use App\Models\JournalEntry;
use App\Models\MemoryShare;
use App\Models\Relationship;
use App\Models\User;
use App\Services\MemoryShareService;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;

class MemoryShareController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected MemoryShareService $service) {}

    public function store(StoreMemoryShareRequest $request, JournalEntry $journalEntry): JsonResponse
    {
        $this->authorize('update', $journalEntry);

        $permission = SharePermission::tryFrom($request->validated('permission') ?? '') ?? SharePermission::View;
        $startsAt = $request->validated('starts_at') ? Carbon::parse($request->validated('starts_at')) : null;
        $endsAt = $request->validated('ends_at') ? Carbon::parse($request->validated('ends_at')) : null;

        if ($request->validated('target_user_id')) {
            $targetUser = User::findOrFail($request->validated('target_user_id'));
            $share = $this->service->shareWithUser($request->user(), $journalEntry, $targetUser, $permission, $startsAt, $endsAt);
        } else {
            $relationship = Relationship::findOrFail($request->validated('relationship_id'));
            $share = $this->service->shareWithRelationship($request->user(), $journalEntry, $relationship, $permission, $startsAt, $endsAt);
        }

        return (new MemoryShareResource($share))
            ->response()
            ->setStatusCode(201);
    }

    public function destroy(MemoryShare $memoryShare): JsonResponse
    {
        $this->authorize('delete', $memoryShare);

        $this->service->revokeShare($memoryShare);

        return response()->json(null, 204);
    }
}
