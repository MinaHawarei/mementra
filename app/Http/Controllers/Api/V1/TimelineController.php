<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\TimelineEventResource;
use App\Services\TimelineService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TimelineController extends Controller
{
    public function __construct(protected TimelineService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $timeline = $this->service->getUserTimeline($request->user());

        return TimelineEventResource::collection($timeline);
    }
}
