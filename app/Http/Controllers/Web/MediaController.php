<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\MemoryMedia;
use App\Services\MediaService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MediaController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected MediaService $service) {}

    public function show(MemoryMedia $media): StreamedResponse
    {
        $this->authorize('view', $media);

        $contents = $this->service->getMediaContents($media);

        return response()->stream(
            function () use ($contents) {
                echo $contents;
            },
            200,
            [
                'Content-Type' => $media->mime_type,
                'Content-Disposition' => 'inline; filename="'.$media->original_filename.'"',
                'Cache-Control' => 'private, max-age=86400',
            ]
        );
    }
}
