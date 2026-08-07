<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\MemoryMediaResource;
use App\Models\MemoryMedia;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MemoriesController extends Controller
{
    public function index(Request $request): Response
    {
        $query = MemoryMedia::with('journalEntry')
            ->where('user_id', $request->user()->id);

        if ($request->filled('year')) {
            $query->whereYear('created_at', $request->input('year'));
        }

        $media = $query->orderByDesc('created_at')->paginate(24)->withQueryString();

        return Inertia::render('memories/index', [
            'mediaItems' => MemoryMediaResource::collection($media),
            'filters' => [
                'year' => $request->input('year', ''),
            ],
        ]);
    }
}
