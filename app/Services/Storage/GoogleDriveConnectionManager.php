<?php

namespace App\Services\Storage;

use App\Enums\StorageConnectionStatus;
use App\Models\StorageConnection;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Log;

class GoogleDriveConnectionManager
{
    public const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

    public function __construct(protected GoogleDriveOAuthService $oauthService) {}

    public function getConnection(User $user): ?StorageConnection
    {
        return StorageConnection::where('user_id', $user->id)
            ->where('provider', 'google_drive')
            ->first();
    }

    public function hasValidConnection(User $user): bool
    {
        $connection = $this->getConnection($user);

        if (! $connection || ! $connection->isConnected()) {
            return false;
        }

        if ($connection->isTokenExpired()) {
            return $this->oauthService->refreshToken($connection);
        }

        return true;
    }

    public function hasDriveScope(?string $grantedScopes): bool
    {
        if ($grantedScopes === null) {
            return true;
        }

        $scopes = preg_split('/\s+/', trim($grantedScopes), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        return in_array(self::DRIVE_FILE_SCOPE, $scopes, true)
            || in_array('https://www.googleapis.com/auth/drive', $scopes, true);
    }

    public function establishOrUpdateConnection(User $user, array $tokenData, array $profileData): StorageConnection
    {
        $accessToken = $tokenData['access_token'] ?? null;
        $newRefreshToken = $tokenData['refresh_token'] ?? null;
        $expiresIn = (int) ($tokenData['expires_in'] ?? 3600);
        $grantedScopes = $tokenData['scope'] ?? null;

        $hasScope = $this->hasDriveScope($grantedScopes);

        if (! $hasScope) {
            return $this->recordMissingDriveScope($user, $tokenData, $profileData);
        }

        $existingConnection = $this->getConnection($user);

        // Never overwrite a valid existing refresh token with null/empty
        $refreshToken = $newRefreshToken ?: $existingConnection?->refresh_token;

        $connection = StorageConnection::updateOrCreate(
            [
                'user_id' => $user->id,
                'provider' => 'google_drive',
            ],
            [
                'provider_account_id' => $profileData['sub'] ?? $existingConnection?->provider_account_id,
                'provider_email' => $profileData['email'] ?? $existingConnection?->provider_email,
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken,
                'token_expires_at' => now()->addSeconds($expiresIn),
                'status' => StorageConnectionStatus::Connected,
                'connected_at' => $existingConnection?->connected_at ?? now(),
                'last_verified_at' => now(),
            ]
        );

        // Provision application folder structure in Google Drive
        $this->provisionApplicationFolders($connection);

        return $connection;
    }

    public function recordMissingDriveScope(User $user, array $tokenData, array $profileData): StorageConnection
    {
        $existingConnection = $this->getConnection($user);

        return StorageConnection::updateOrCreate(
            [
                'user_id' => $user->id,
                'provider' => 'google_drive',
            ],
            [
                'provider_account_id' => $profileData['sub'] ?? $existingConnection?->provider_account_id,
                'provider_email' => $profileData['email'] ?? $existingConnection?->provider_email,
                'status' => StorageConnectionStatus::ReauthorizationRequired,
                'last_verified_at' => now(),
            ]
        );
    }

    public function provisionApplicationFolders(StorageConnection $connection): void
    {
        if (! $connection->access_token) {
            return;
        }

        try {
            $accessToken = $connection->access_token;

            // 1. Root Mementra folder
            $rootFolderId = $connection->root_folder_id;
            if (! $rootFolderId || ! $this->oauthService->checkFolderExists($accessToken, $rootFolderId)) {
                $rootFolderId = $this->oauthService->findOrCreateFolder($accessToken, 'Mementra');
                $connection->update(['root_folder_id' => $rootFolderId]);
            }

            // 2. Saved Memories folder
            $savedFolderId = $connection->saved_folder_id;
            if (! $savedFolderId || ! $this->oauthService->checkFolderExists($accessToken, $savedFolderId)) {
                $savedFolderId = $this->oauthService->findOrCreateFolder($accessToken, 'Saved Memories', $rootFolderId);
                $connection->update(['saved_folder_id' => $savedFolderId]);
            }
        } catch (Exception $e) {
            Log::warning('Could not automatically provision Google Drive folders during connection setup', [
                'connection_id' => $connection->id,
                'user_id' => $connection->user_id,
                'message' => $e->getMessage(),
            ]);
        }
    }

    public function verifyConnection(StorageConnection $connection): array
    {
        return $this->oauthService->testConnection($connection);
    }

    public function disconnect(StorageConnection $connection): bool
    {
        return $this->oauthService->disconnect($connection);
    }
}
