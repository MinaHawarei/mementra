<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Storage\GoogleDriveConnectionManager;
use App\Services\Storage\GoogleDriveOAuthService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class GoogleAuthController extends Controller
{
    public function __construct(
        protected GoogleDriveOAuthService $oauthService,
        protected GoogleDriveConnectionManager $connectionManager,
    ) {}

    public function redirect(Request $request): SymfonyResponse
    {
        try {
            $url = $this->oauthService->getAuthAuthorizationUrl();

            return $request->inertia()
                ? Inertia::location($url)
                : redirect()->away($url);
        } catch (Exception $e) {
            Log::error('Google auth initialization failed', ['error' => $e->getMessage()]);

            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Google authentication is currently unavailable: '.$e->getMessage(),
            ]);

            return back()->with('error', 'Google authentication is currently unavailable: '.$e->getMessage());
        }
    }

    public function callback(Request $request): RedirectResponse
    {
        if ($request->has('error')) {
            $error = (string) $request->input('error');
            $message = $error === 'access_denied'
                ? 'Google sign-in was cancelled.'
                : 'Google sign-in failed: '.$error;

            Inertia::flash('toast', ['type' => 'error', 'message' => $message]);

            return redirect()->route('login')->with('error', $message);
        }

        $code = (string) $request->input('code');
        $state = (string) $request->input('state');

        if (! $code || ! $state) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Invalid Google sign-in response.']);

            return redirect()->route('login')->with('error', 'Invalid Google sign-in response.');
        }

        if (! $this->oauthService->validateAuthState($state)) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Sign-in session expired or invalid state. Please try again.',
            ]);

            return redirect()->route('login')->with('error', 'Sign-in session expired or invalid state. Please try again.');
        }

        try {
            $tokenData = $this->oauthService->exchangeCodeForTokens($code, config('services.google_drive.auth_redirect_uri'));
            $profile = $this->oauthService->fetchUserProfile($tokenData['access_token']);
        } catch (Exception $e) {
            Log::error('Google OAuth callback token/profile exchange failed', ['error' => $e->getMessage()]);

            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Failed to authenticate with Google: '.$e->getMessage(),
            ]);

            return redirect()->route('login')->with('error', 'Failed to authenticate with Google: '.$e->getMessage());
        }

        $googleSub = $profile['sub'] ?? null;
        $googleEmail = $profile['email'] ?? null;
        $emailVerified = ($profile['email_verified'] ?? false) === true || ($profile['email_verified'] ?? false) === 'true';

        if (! $googleSub || ! $googleEmail) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Google account information is incomplete.']);

            return redirect()->route('login')->with('error', 'Google account information is incomplete.');
        }

        // Scenario B: Existing user with Google ID
        $user = User::where('google_id', $googleSub)->first();

        if ($user) {
            if (! empty($profile['picture']) && $user->google_avatar !== $profile['picture']) {
                $user->update(['google_avatar' => $profile['picture']]);
            }
        } else {
            // Scenario C: Existing user with same email
            $existingUserWithEmail = User::where('email', $googleEmail)->first();

            if ($existingUserWithEmail) {
                // Strict security check: Never merge accounts based on unverified email
                if (! $emailVerified) {
                    Inertia::flash('toast', [
                        'type' => 'error',
                        'message' => 'This Google account email has not been verified by Google. For security reasons, we cannot link it to your existing account.',
                    ]);

                    return redirect()->route('login')->with(
                        'error',
                        'This Google account email has not been verified by Google. For security reasons, we cannot link it to your existing account.'
                    );
                }

                $existingUserWithEmail->update([
                    'google_id' => $googleSub,
                    'google_avatar' => $profile['picture'] ?? $existingUserWithEmail->google_avatar,
                    'email_verified_at' => $existingUserWithEmail->email_verified_at ?? now(),
                ]);

                $user = $existingUserWithEmail;
            } else {
                // Scenario A: New user registration
                $user = User::create([
                    'name' => $profile['name'] ?? explode('@', (string) $googleEmail)[0],
                    'email' => $googleEmail,
                    'google_id' => $googleSub,
                    'google_avatar' => $profile['picture'] ?? null,
                    'email_verified_at' => $emailVerified ? now() : null,
                    'password' => null,
                ]);
            }
        }

        Auth::login($user, remember: true);
        $request->session()->regenerate();

        // Check Google Drive permission
        $grantedScopes = $tokenData['scope'] ?? null;
        $hasDrive = $this->connectionManager->hasDriveScope($grantedScopes);

        if ($hasDrive) {
            $this->connectionManager->establishOrUpdateConnection($user, $tokenData, $profile);

            $message = 'Signed in successfully! Your Google Drive has been connected to store your memories.';
            Inertia::flash('toast', ['type' => 'success', 'message' => $message]);

            return redirect()->intended(route('dashboard'))->with('success', $message);
        }

        // Scenario D: User declined Drive scope
        $this->connectionManager->recordMissingDriveScope($user, $tokenData, $profile);

        $warningMessage = 'Signed in with Google, but Google Drive access was not granted. Please connect Google Drive in Settings to enable personal cloud media uploads.';
        Inertia::flash('toast', ['type' => 'warning', 'message' => $warningMessage]);

        return redirect()->intended(route('dashboard'))->with('warning', $warningMessage);
    }
}
