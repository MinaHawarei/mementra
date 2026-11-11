<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\MemoryMediaResource;
use App\Models\MemoryMedia;
use App\Models\MemoryShare;
use App\Models\SavedMedia;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MemoriesController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $relationshipIds = $user->relationships()->pluck('relationships.id');

        $sharedJournalIds = MemoryShare::query()
            ->where('resource_type', 'journal_entry')
            ->where(function ($q) use ($user, $relationshipIds) {
                $q->where('target_user_id', $user->id)
                    ->orWhereIn('relationship_id', $relationshipIds);
            })
            ->whereNull('revoked_at')
            ->where(fn ($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>=', now()))
            ->pluck('resource_id');

        $query = MemoryMedia::with(['journalEntry', 'owner'])
            ->where(function ($q) use ($user, $sharedJournalIds) {
                $q->where('user_id', $user->id)
                    ->orWhereIn('journal_entry_id', $sharedJournalIds);
            });

        if ($request->filled('year')) {
            $query->whereYear('created_at', $request->input('year'));
        }

        $media = $query->orderByDesc('created_at')->paginate(24)->withQueryString();

        $savedMediaIds = SavedMedia::where('user_id', $user->id)
            ->pluck('original_media_id')
            ->filter()
            ->values();

        return Inertia::render('memories/index', [
            'mediaItems' => MemoryMediaResource::collection($media),
            'hasGoogleDrive' => (bool) $user->googleDriveConnection,
            'savedMediaIds' => $savedMediaIds,
            'filters' => [
                'year' => $request->input('year', ''),
            ],
        ]);
    }
}
