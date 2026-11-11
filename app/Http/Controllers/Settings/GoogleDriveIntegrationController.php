<?php

namespace App\Http\Controllers\Settings;

use App\Enums\StorageConnectionStatus;
use App\Http\Controllers\Controller;
use App\Models\StorageConnection;
use App\Services\Storage\GoogleDriveOAuthService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class GoogleDriveIntegrationController extends Controller
{
    public function __construct(protected GoogleDriveOAuthService $oauthService) {}

    public function index(Request $request): Response
    {
        $connection = StorageConnection::where('user_id', $request->user()->id)
            ->where('provider', 'google_drive')
            ->first();

        return Inertia::render('settings/integrations', [
            'connection' => $connection ? [
                'id' => $connection->id,
                'provider' => $connection->provider,
                'provider_email' => $connection->provider_email,
                'status' => $connection->status->value,
                'is_connected' => $connection->isConnected(),
                'connected_at' => $connection->connected_at?->toIso8601String(),
                'last_verified_at' => $connection->last_verified_at?->toIso8601String(),
            ] : null,
        ]);
    }

    public function redirect(Request $request): SymfonyResponse
    {
        try {
            $url = $this->oauthService->getAuthorizationUrl($request->user());

            return $request->inertia()
                ? Inertia::location($url)
                : redirect()->away($url);
        } catch (Exception $e) {
            return back()->with('error', 'Google Drive OAuth initialization failed: '.$e->getMessage());
        }
    }

    public function callback(Request $request): RedirectResponse
    {
        if ($request->has('error')) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Google authorization was denied or cancelled: '.$request->input('error')]);

            return redirect()->route('integrations.index')
                ->with('error', 'Google authorization was denied or cancelled: '.$request->input('error'));
        }

        $code = $request->input('code');
        $state = $request->input('state');

        if (! $code || ! $state) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Invalid Google OAuth callback response.']);

            return redirect()->route('integrations.index')
                ->with('error', 'Invalid Google OAuth callback response.');
        }

        try {
            $connection = $this->oauthService->handleCallback($request->user(), $code, $state);

            if ($connection->status === StorageConnectionStatus::Connected) {
                Inertia::flash('toast', ['type' => 'success', 'message' => 'Your Google Drive account has been connected successfully!']);

                return redirect()->route('integrations.index')
                    ->with('success', 'Your Google Drive account has been connected successfully!');
            }

            Inertia::flash('toast', ['type' => 'warning', 'message' => 'Google account linked, but Google Drive permission was not granted. Please reconnect and grant Drive access.']);

            return redirect()->route('integrations.index')
                ->with('warning', 'Google account linked, but Google Drive permission was not granted. Please reconnect and grant Drive access.');
        } catch (Exception $e) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Failed to connect Google Drive: '.$e->getMessage()]);

            return redirect()->route('integrations.index')
                ->with('error', 'Failed to connect Google Drive: '.$e->getMessage());
        }
    }

    public function disconnect(Request $request): RedirectResponse
    {
        $connection = StorageConnection::where('user_id', $request->user()->id)
            ->where('provider', 'google_drive')
            ->first();

        if ($connection) {
            $this->oauthService->disconnect($connection);
        }

        return redirect()->route('integrations.index')
            ->with('success', 'Your Google Drive connection has been disconnected.');
    }

    public function testConnection(Request $request): JsonResponse|RedirectResponse
    {
        $connection = StorageConnection::where('user_id', $request->user()->id)
            ->where('provider', 'google_drive')
            ->first();

        if (! $connection) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No Google Drive connection found.',
                ], 404);
            }

            return back()->with('error', 'No Google Drive connection found.');
        }

        $result = $this->oauthService->testConnection($connection);

        if ($request->wantsJson()) {
            return response()->json($result);
        }

        if ($result['success']) {
            return back()->with('success', $result['message']);
        }

        return back()->with('error', $result['message']);
    }
}
