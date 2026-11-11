<?php

namespace App\Http\Controllers\Web;

use App\Enums\RelationshipType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreRelationshipRequest;
use App\Http\Resources\Api\V1\RelationshipResource;
use App\Models\Relationship;
use App\Models\User;
use App\Services\RelationshipService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RelationshipController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected RelationshipService $service) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $relationships = $user->relationships()
            ->with(['members', 'creator'])
            ->orderByDesc('created_at')
            ->get();

        $resolved = RelationshipResource::collection($relationships)
            ->response()
            ->getData(true)['data'];

        return Inertia::render('relationship/index', [
            'relationships' => $resolved,
        ]);
    }

    public function store(StoreRelationshipRequest $request): RedirectResponse
    {
        $this->authorize('create', Relationship::class);

        $partner = User::where('email', $request->validated('partner_email'))->firstOrFail();
        $type = RelationshipType::tryFrom($request->validated('type') ?? '') ?? RelationshipType::Couple;

        $this->service->initiateConnection(
            $request->user(),
            $partner,
            $type,
            $request->validated('name')
        );

        return redirect()->route('relationship.index')
            ->with('success', "Invitation sent to {$partner->email}!");
    }

    public function accept(Relationship $relationship): RedirectResponse
    {
        $this->authorize('accept', $relationship);

        $this->service->acceptConnection($relationship, request()->user());

        return redirect()->route('relationship.index')
            ->with('success', 'Partner invitation accepted! Your shared story is now connected.');
    }

    public function decline(Relationship $relationship): RedirectResponse
    {
        $this->authorize('decline', $relationship);

        $this->service->declineConnection($relationship);

        return redirect()->route('relationship.index')
            ->with('info', 'Partner invitation declined.');
    }

    public function cancel(Relationship $relationship): RedirectResponse
    {
        $this->authorize('cancel', $relationship);

        $this->service->cancelConnection($relationship);

        return redirect()->route('relationship.index')
            ->with('info', 'Partner invitation cancelled.');
    }

    public function end(Relationship $relationship): RedirectResponse
    {
        $this->authorize('delete', $relationship);

        $this->service->endRelationship($relationship);

        return redirect()->route('relationship.index')
            ->with('info', 'Relationship connection ended. Your personal memories remain safe.');
    }
}
