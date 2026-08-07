<?php

namespace App\Http\Controllers\Web;

use App\Enums\SharePermission;
use App\Http\Controllers\Controller;
use App\Models\JournalEntry;
use App\Models\MemoryShare;
use App\Models\User;
use App\Services\MemoryShareService;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ShareController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected MemoryShareService $service) {}

    public function store(Request $request, JournalEntry $journal): RedirectResponse
    {
        $this->authorize('update', $journal);

        $validated = $request->validate([
            'target_user_id' => ['required', 'exists:users,id'],
            'permission' => ['nullable', 'string'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ]);

        $targetUser = User::findOrFail($validated['target_user_id']);
        $permission = SharePermission::tryFrom($validated['permission'] ?? 'view') ?? SharePermission::View;
        $startsAt = ! empty($validated['starts_at']) ? Carbon::parse($validated['starts_at']) : null;
        $endsAt = ! empty($validated['ends_at']) ? Carbon::parse($validated['ends_at']) : null;

        $this->service->shareWithUser(
            $request->user(),
            $journal,
            $targetUser,
            $permission,
            $startsAt,
            $endsAt
        );

        return redirect()->route('journal.show', $journal->id);
    }

    public function destroy(MemoryShare $share): RedirectResponse
    {
        $this->authorize('delete', $share);

        $journalId = $share->resource_id;

        $this->service->revokeShare($share);

        return redirect()->route('journal.show', $journalId);
    }
}
