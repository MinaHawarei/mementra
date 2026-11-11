<?php

namespace App\Services\Storage;

use App\Enums\StorageConnectionStatus;
use App\Models\StorageConnection;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;

class GoogleDriveOAuthService
{
    public const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

    public const USERINFO_EMAIL_SCOPE = 'https://www.googleapis.com/auth/userinfo.email';

    public const USERINFO_PROFILE_SCOPE = 'https://www.googleapis.com/auth/userinfo.profile';

    public const OPENID_SCOPE = 'openid';

    protected ?string $clientId;

    protected ?string $clientSecret;

    protected ?string $redirectUri;

    protected ?string $authRedirectUri;

    public function __construct()
    {
        $this->clientId = config('services.google_drive.client_id');
        $this->clientSecret = config('services.google_drive.client_secret');
        $this->redirectUri = config('services.google_drive.redirect_uri');
        $this->authRedirectUri = config('services.google_drive.auth_redirect_uri');
    }

    public function getAuthorizationUrl(User $user): string
    {
        if (! $this->clientId) {
            throw new Exception('Google Drive Client ID is not configured.');
        }

        $stateToken = Str::random(40);
        Session::put("google_drive_oauth_state_{$user->id}", $stateToken);

        $params = [
            'client_id' => $this->clientId,
            'redirect_uri' => $this->redirectUri,
            'response_type' => 'code',
            'scope' => implode(' ', [
                self::DRIVE_FILE_SCOPE,
                self::USERINFO_EMAIL_SCOPE,
                self::USERINFO_PROFILE_SCOPE,
            ]),
            'access_type' => 'offline',
            'prompt' => 'consent',
            'state' => "{$user->id}:{$stateToken}",
            'include_granted_scopes' => 'true',
        ];

        return 'https://accounts.google.com/o/oauth2/v2/auth?'.http_build_query($params);
    }

    public function getAuthAuthorizationUrl(?string $redirectUri = null): string
    {
        if (! $this->clientId) {
            throw new Exception('Google OAuth Client ID is not configured.');
        }

        $targetRedirectUri = $redirectUri ?: $this->authRedirectUri ?: $this->redirectUri;
        $stateToken = Str::random(40);

        Session::put('google_auth_oauth_state', $stateToken);
        Cache::put("google_auth_oauth_state_{$stateToken}", true, now()->addMinutes(15));

        $params = [
            'client_id' => $this->clientId,
            'redirect_uri' => $targetRedirectUri,
            'response_type' => 'code',
            'scope' => implode(' ', [
                self::OPENID_SCOPE,
                self::USERINFO_EMAIL_SCOPE,
                self::USERINFO_PROFILE_SCOPE,
                self::DRIVE_FILE_SCOPE,
            ]),
            'access_type' => 'offline',
            'prompt' => 'select_account consent',
            'state' => $stateToken,
            'include_granted_scopes' => 'true',
        ];

        return 'https://accounts.google.com/o/oauth2/v2/auth?'.http_build_query($params);
    }

    public function validateAuthState(string $state): bool
    {
        $sessionToken = Session::pull('google_auth_oauth_state');
        $cacheToken = Cache::pull("google_auth_oauth_state_{$state}");

        if ($sessionToken && hash_equals($sessionToken, $state)) {
            return true;
        }

        return (bool) $cacheToken;
    }

    public function exchangeCodeForTokens(string $code, ?string $redirectUri = null): array
    {
        if (! $this->clientId || ! $this->clientSecret) {
            throw new Exception('Google OAuth credentials are not configured.');
        }

        $targetRedirectUri = $redirectUri ?: $this->redirectUri;

        $tokenResponse = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'code' => $code,
            'grant_type' => 'authorization_code',
            'redirect_uri' => $targetRedirectUri,
        ]);

        if ($tokenResponse->failed()) {
            Log::error('Google OAuth token exchange failed', [
                'status' => $tokenResponse->status(),
                'error' => $tokenResponse->json('error_description') ?? $tokenResponse->body(),
            ]);

            throw new Exception('Failed to exchange authorization code for Google tokens: '.($tokenResponse->json('error_description') ?? $tokenResponse->body()));
        }

        $tokenData = $tokenResponse->json();
        if (empty($tokenData['access_token'])) {
            throw new Exception('Google response did not include an access token.');
        }

        return $tokenData;
    }

    public function fetchUserProfile(string $accessToken): array
    {
        $profileResponse = Http::withToken($accessToken)
            ->get('https://www.googleapis.com/oauth2/v3/userinfo');

        if ($profileResponse->failed()) {
            Log::error('Failed to fetch user profile from Google', [
                'status' => $profileResponse->status(),
                'error' => $profileResponse->body(),
            ]);

            throw new Exception('Failed to fetch user profile from Google.');
        }

        return $profileResponse->json() ?? [];
    }

    public function handleCallback(User $user, string $code, string $state): StorageConnection
    {
        $this->validateState($user, $state);

        $tokenData = $this->exchangeCodeForTokens($code, $this->redirectUri);
        $profileData = $this->fetchUserProfile($tokenData['access_token']);

        return app(GoogleDriveConnectionManager::class)->establishOrUpdateConnection($user, $tokenData, $profileData);
    }

    public function refreshToken(StorageConnection $connection): bool
    {
        if (! $connection->refresh_token) {
            $connection->update(['status' => StorageConnectionStatus::ReauthorizationRequired]);

            return false;
        }

        if (! $this->clientId || ! $this->clientSecret) {
            Log::error('Cannot refresh Google Drive token: client credentials missing.');

            return false;
        }

        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'refresh_token' => $connection->refresh_token,
            'grant_type' => 'refresh_token',
        ]);

        if ($response->failed()) {
            $error = $response->json('error');
            Log::warning('Google Drive token refresh failed', [
                'connection_id' => $connection->id,
                'user_id' => $connection->user_id,
                'error' => $error,
            ]);

            if (in_array($error, ['invalid_grant', 'unauthorized_client'])) {
                $connection->update([
                    'status' => StorageConnectionStatus::ReauthorizationRequired,
                ]);
            } else {
                $connection->update([
                    'status' => StorageConnectionStatus::Error,
                ]);
            }

            return false;
        }

        $data = $response->json();
        $expiresIn = (int) ($data['expires_in'] ?? 3600);

        $updates = [
            'access_token' => $data['access_token'],
            'token_expires_at' => now()->addSeconds($expiresIn),
            'status' => StorageConnectionStatus::Connected,
            'last_verified_at' => now(),
        ];

        if (! empty($data['refresh_token'])) {
            $updates['refresh_token'] = $data['refresh_token'];
        }

        $connection->update($updates);

        return true;
    }

    public function disconnect(StorageConnection $connection): bool
    {
        $tokenToRevoke = $connection->refresh_token ?? $connection->access_token;

        if ($tokenToRevoke) {
            try {
                Http::asForm()->post('https://oauth2.googleapis.com/revoke', [
                    'token' => $tokenToRevoke,
                ]);
            } catch (Exception $e) {
                Log::notice('Could not revoke Google token with Google endpoint', [
                    'message' => $e->getMessage(),
                ]);
            }
        }

        $connection->disconnect();

        return true;
    }

    public function testConnection(StorageConnection $connection): array
    {
        if (! $connection->isConnected()) {
            return [
                'success' => false,
                'message' => 'Connection is not active.',
                'status' => $connection->status->value,
            ];
        }

        if ($connection->isTokenExpired()) {
            $refreshed = $this->refreshToken($connection);
            if (! $refreshed) {
                return [
                    'success' => false,
                    'message' => 'Token has expired and could not be refreshed. Please reconnect.',
                    'status' => $connection->status->value,
                ];
            }
        }

        $response = Http::withToken($connection->access_token)
            ->get('https://www.googleapis.com/drive/v3/about?fields=user,storageQuota');

        if ($response->failed()) {
            return [
                'success' => false,
                'message' => 'Failed to reach Google Drive API.',
                'status' => $connection->status->value,
            ];
        }

        $data = $response->json();
        $email = $data['user']['emailAddress'] ?? $connection->provider_email;

        $connection->update(['last_verified_at' => now()]);

        return [
            'success' => true,
            'message' => 'Google Drive connection is working properly.',
            'email' => $email,
            'storage_quota' => $data['storageQuota'] ?? null,
            'status' => $connection->status->value,
        ];
    }

    public function provisionFolders(StorageConnection $connection): void
    {
        if (! $connection->access_token) {
            return;
        }

        try {
            // 1. Ensure Root Mementra Folder
            $rootFolderId = $connection->root_folder_id;
            if (! $rootFolderId || ! $this->checkFolderExists($connection->access_token, $rootFolderId)) {
                $rootFolderId = $this->findOrCreateFolder($connection->access_token, 'Mementra');
                $connection->update(['root_folder_id' => $rootFolderId]);
            }

            // 2. Ensure Saved Memories Folder
            $savedFolderId = $connection->saved_folder_id;
            if (! $savedFolderId || ! $this->checkFolderExists($connection->access_token, $savedFolderId)) {
                $savedFolderId = $this->findOrCreateFolder($connection->access_token, 'Saved Memories', $rootFolderId);
                $connection->update(['saved_folder_id' => $savedFolderId]);
            }
        } catch (Exception $e) {
            Log::warning('Could not automatically provision Google Drive folders', [
                'connection_id' => $connection->id,
                'message' => $e->getMessage(),
            ]);
        }
    }

    public function findOrCreateFolder(string $accessToken, string $name, ?string $parentId = null): string
    {
        // Search for existing folder
        $query = "name = '{$name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
        if ($parentId) {
            $query .= " and '{$parentId}' in parents";
        }

        $searchResponse = Http::withToken($accessToken)
            ->get('https://www.googleapis.com/drive/v3/files', [
                'q' => $query,
                'fields' => 'files(id, name)',
                'pageSize' => 1,
            ]);

        if ($searchResponse->successful()) {
            $files = $searchResponse->json('files');
            if (! empty($files) && isset($files[0]['id'])) {
                return $files[0]['id'];
            }
        }

        // Create folder
        $payload = [
            'name' => $name,
            'mimeType' => 'application/vnd.google-apps.folder',
        ];

        if ($parentId) {
            $payload['parents'] = [$parentId];
        }

        $createResponse = Http::withToken($accessToken)
            ->post('https://www.googleapis.com/drive/v3/files?fields=id,name', $payload);

        if ($createResponse->failed()) {
            throw new Exception("Failed to create Google Drive folder [{$name}]: ".$createResponse->body());
        }

        return $createResponse->json('id');
    }

    public function checkFolderExists(string $accessToken, string $folderId): bool
    {
        $response = Http::withToken($accessToken)
            ->get("https://www.googleapis.com/drive/v3/files/{$folderId}?fields=id,trashed");

        if ($response->failed()) {
            return false;
        }

        return ! ($response->json('trashed') ?? false);
    }

    protected function validateState(User $user, string $state): void
    {
        $parts = explode(':', $state, 2);
        if (count($parts) !== 2) {
            throw new Exception('Invalid OAuth state parameter format.');
        }

        [$stateUserId, $stateToken] = $parts;

        if ((int) $stateUserId !== $user->id) {
            throw new Exception('OAuth state user mismatch.');
        }

        $expectedToken = Session::pull("google_drive_oauth_state_{$user->id}");

        if (! $expectedToken || ! hash_equals($expectedToken, $stateToken)) {
            throw new Exception('OAuth state token verification failed (CSRF protection).');
        }
    }
}
