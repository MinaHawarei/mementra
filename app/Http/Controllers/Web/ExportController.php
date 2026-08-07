<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\ExportResource;
use App\Jobs\GenerateMemoryBookJob;
use App\Models\MemoryExport;
use App\Services\Export\ExportServiceInterface;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected ExportServiceInterface $exportService) {}

    public function index(Request $request): Response
    {
        $exports = MemoryExport::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('exports/index', [
            'exports' => ExportResource::collection($exports)->resolve(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'locale' => ['nullable', 'string', 'in:en,ar'],
        ]);

        $export = $this->exportService->createExport($request->user(), $validated);

        GenerateMemoryBookJob::dispatch($export);

        return redirect()->route('exports.index');
    }

    public function download(Request $request, MemoryExport $export): StreamedResponse|RedirectResponse
    {
        if ($export->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized export access.');
        }

        if ($export->status !== 'completed' || ! $export->file_path || ! Storage::disk('local')->exists($export->file_path)) {
            abort(404, 'Export file not found or expired.');
        }

        return Storage::disk('local')->download($export->file_path, "{$export->title}.html");
    }
}
