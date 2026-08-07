<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\TimelineEventResource;
use App\Services\TimelineService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TimelineController extends Controller
{
    public function __construct(protected TimelineService $service) {}

    public function index(Request $request): Response
    {
        $events = $this->service->getUserTimelinePaginated($request->user());

        return Inertia::render('timeline/index', [
            'events' => TimelineEventResource::collection($events),
        ]);
    }
}
