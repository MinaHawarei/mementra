<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\RelationshipType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreRelationshipRequest;
use App\Http\Resources\Api\V1\RelationshipResource;
use App\Models\Relationship;
use App\Models\User;
use App\Services\RelationshipService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RelationshipController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected RelationshipService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $relationships = $request->user()
            ->relationships()
            ->with('members')
            ->orderByDesc('created_at')
            ->get();

        return RelationshipResource::collection($relationships);
    }

    public function store(StoreRelationshipRequest $request): JsonResponse
    {
        $partner = User::where('email', $request->validated('partner_email'))->firstOrFail();
        $type = RelationshipType::tryFrom($request->validated('type') ?? '') ?? RelationshipType::Couple;

        $relationship = $this->service->initiateConnection(
            $request->user(),
            $partner,
            $type,
            $request->validated('name')
        );

        return (new RelationshipResource($relationship->load('members')))
            ->response()
            ->setStatusCode(201);
    }

    public function accept(Relationship $relationship): RelationshipResource
    {
        $this->authorize('update', $relationship);

        $this->service->acceptConnection($relationship);

        return new RelationshipResource($relationship->fresh('members'));
    }

    public function decline(Relationship $relationship): RelationshipResource
    {
        $this->authorize('update', $relationship);

        $this->service->declineConnection($relationship);

        return new RelationshipResource($relationship->fresh('members'));
    }

    public function end(Relationship $relationship): RelationshipResource
    {
        $this->authorize('delete', $relationship);

        $this->service->endRelationship($relationship);

        return new RelationshipResource($relationship->fresh('members'));
    }
}
