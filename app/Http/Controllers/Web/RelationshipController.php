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
        $relationships = $request->user()
            ->relationships()
            ->with('members')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('relationship/index', [
            'relationships' => RelationshipResource::collection($relationships)->resolve(),
        ]);
    }

    public function store(StoreRelationshipRequest $request): RedirectResponse
    {
        $partner = User::where('email', $request->validated('partner_email'))->firstOrFail();
        $type = RelationshipType::tryFrom($request->validated('type') ?? '') ?? RelationshipType::Couple;

        $this->service->initiateConnection(
            $request->user(),
            $partner,
            $type,
            $request->validated('name')
        );

        return redirect()->route('relationship.index');
    }

    public function accept(Relationship $relationship): RedirectResponse
    {
        $this->authorize('update', $relationship);

        $this->service->acceptConnection($relationship);

        return redirect()->route('relationship.index');
    }

    public function end(Relationship $relationship): RedirectResponse
    {
        $this->authorize('delete', $relationship);

        $this->service->endRelationship($relationship);

        return redirect()->route('relationship.index');
    }
}
