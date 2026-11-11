<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\MemoryMedia;
use App\Models\SavedMedia;
use App\Services\MediaService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Throwable;

class MediaController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected MediaService $service) {}

    public function show(MemoryMedia $media): SymfonyResponse
    {
        $this->authorize('view', $media);

        try {
            $contents = $this->service->getMediaContents($media);
        } catch (Throwable) {
            abort(404, 'Media file could not be retrieved from storage.');
        }

        if (empty($contents)) {
            abort(404, 'Media file is empty or unavailable.');
        }

        $size = strlen($contents);

        return response($contents, 200, [
            'Content-Type' => $media->mime_type,
            'Content-Length' => (string) $size,
            'Content-Disposition' => 'inline; filename="'.addslashes($media->original_filename).'"',
            'Cache-Control' => 'private, max-age=86400',
        ]);
    }

    public function download(MemoryMedia $media): SymfonyResponse
    {
        $this->authorize('view', $media);

        try {
            $contents = $this->service->getMediaContents($media);
        } catch (Throwable) {
            abort(404, 'Media file could not be retrieved from storage.');
        }

        if (empty($contents)) {
            abort(404, 'Media file is empty or unavailable.');
        }

        $size = strlen($contents);

        return response($contents, 200, [
            'Content-Type' => $media->mime_type,
            'Content-Length' => (string) $size,
            'Content-Disposition' => 'attachment; filename="'.addslashes($media->original_filename).'"',
            'Cache-Control' => 'no-cache, private',
        ]);
    }

    public function saveToDrive(Request $request, MemoryMedia $media): JsonResponse|RedirectResponse
    {
        $this->authorize('saveToDrive', $media);

        $user = $request->user();

        if (! $user->googleDriveConnection) {
            $message = 'Please connect your personal Google Drive in Settings -> Integrations first.';
            if ($request->wantsJson()) {
                return response()->json(['error' => $message], 422);
            }

            return back()->with('error', $message);
        }

        try {
            $saved = $this->service->saveMediaToUserDrive($user, $media);

            $message = 'Memory saved to your personal Google Drive!';
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'saved_id' => $saved->id,
                ]);
            }

            return back()->with('success', $message);
        } catch (Throwable $e) {
            $errorMsg = 'Failed to save to Google Drive: '.$e->getMessage();
            if ($request->wantsJson()) {
                return response()->json(['error' => $errorMsg], 500);
            }

            return back()->with('error', $errorMsg);
        }
    }

    public function showSaved(Request $request, SavedMedia $savedMedia): SymfonyResponse
    {
        if ($savedMedia->user_id !== $request->user()->id) {
            abort(403);
        }

        try {
            $contents = $this->service->getSavedMediaContents($savedMedia);
        } catch (Throwable) {
            abort(404, 'Saved media file could not be retrieved from storage.');
        }

        $size = strlen($contents);

        return response($contents, 200, [
            'Content-Type' => $savedMedia->mime_type,
            'Content-Length' => (string) $size,
            'Content-Disposition' => 'inline; filename="'.addslashes($savedMedia->original_filename).'"',
            'Cache-Control' => 'private, max-age=86400',
        ]);
    }

    public function downloadSaved(Request $request, SavedMedia $savedMedia): SymfonyResponse
    {
        if ($savedMedia->user_id !== $request->user()->id) {
            abort(403);
        }

        try {
            $contents = $this->service->getSavedMediaContents($savedMedia);
        } catch (Throwable) {
            abort(404, 'Saved media file could not be retrieved from storage.');
        }

        $size = strlen($contents);

        return response($contents, 200, [
            'Content-Type' => $savedMedia->mime_type,
            'Content-Length' => (string) $size,
            'Content-Disposition' => 'attachment; filename="'.addslashes($savedMedia->original_filename).'"',
            'Cache-Control' => 'no-cache, private',
        ]);
    }
}
