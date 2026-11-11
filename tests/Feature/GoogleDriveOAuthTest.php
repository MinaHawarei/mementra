<?php

use App\Enums\StorageConnectionStatus;
use App\Models\StorageConnection;
use App\Models\User;
use App\Services\Storage\GoogleDriveOAuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Session;

uses(RefreshDatabase::class);

beforeEach(function () {
    Config::set('services.google_drive.client_id', 'mock-client-id.apps.googleusercontent.com');
    Config::set('services.google_drive.client_secret', 'mock-client-secret');
    Config::set('services.google_drive.redirect_uri', 'http://localhost/integrations/google-drive/callback');
});

test('google oauth authorization url contains required parameters and least privilege scope', function () {
    $user = User::factory()->create();
    $service = app(GoogleDriveOAuthService::class);

    $url = $service->getAuthorizationUrl($user);

    expect($url)->toContain('https://accounts.google.com/o/oauth2/v2/auth')
        ->and($url)->toContain('client_id=mock-client-id.apps.googleusercontent.com')
        ->and($url)->toContain(urlencode(GoogleDriveOAuthService::DRIVE_FILE_SCOPE))
        ->and($url)->toContain('access_type=offline')
        ->and($url)->toContain('prompt=consent')
        ->and(Session::has("google_drive_oauth_state_{$user->id}"))->toBeTrue();
});

test('google oauth callback validates csrf state and exchanges code for encrypted tokens', function () {
    $user = User::factory()->create();
    $service = app(GoogleDriveOAuthService::class);

    $authUrl = $service->getAuthorizationUrl($user);
    $stateToken = Session::get("google_drive_oauth_state_{$user->id}");
    $state = "{$user->id}:{$stateToken}";

    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response([
            'access_token' => 'mock-access-token-xyz',
            'refresh_token' => 'mock-refresh-token-abc',
            'expires_in' => 3600,
            'token_type' => 'Bearer',
        ], 200),
        'https://www.googleapis.com/oauth2/v3/userinfo' => Http::response([
            'sub' => 'google-user-12345',
            'email' => 'couple@gmail.com',
            'name' => 'Couple User',
        ], 200),
        'https://www.googleapis.com/drive/v3/files*' => Http::response([
            'id' => 'mock-folder-id',
            'name' => 'Mementra',
            'files' => [],
        ], 200),
    ]);

    $connection = $service->handleCallback($user, 'mock-auth-code', $state);

    expect($connection)->toBeInstanceOf(StorageConnection::class)
        ->and($connection->user_id)->toBe($user->id)
        ->and($connection->provider)->toBe('google_drive')
        ->and($connection->provider_email)->toBe('couple@gmail.com')
        ->and($connection->provider_account_id)->toBe('google-user-12345')
        ->and($connection->access_token)->toBe('mock-access-token-xyz')
        ->and($connection->refresh_token)->toBe('mock-refresh-token-abc')
        ->and($connection->status)->toBe(StorageConnectionStatus::Connected)
        ->and($connection->isConnected())->toBeTrue();

    // Verify token is encrypted at rest in the database
    $rawRecord = DB::table('storage_connections')->where('id', $connection->id)->first();
    expect($rawRecord->access_token)->not->toBe('mock-access-token-xyz')
        ->and($rawRecord->refresh_token)->not->toBe('mock-refresh-token-abc');
});

test('google oauth callback rejects invalid csrf state token', function () {
    $user = User::factory()->create();
    $service = app(GoogleDriveOAuthService::class);

    $service->getAuthorizationUrl($user);

    expect(fn () => $service->handleCallback($user, 'mock-code', "{$user->id}:invalid-csrf-token"))
        ->toThrow(Exception::class);
});

test('token refresh successfully updates access token', function () {
    $user = User::factory()->create();
    $connection = StorageConnection::create([
        'user_id' => $user->id,
        'provider' => 'google_drive',
        'provider_email' => 'user@gmail.com',
        'access_token' => 'old-token',
        'refresh_token' => 'mock-refresh-token',
        'token_expires_at' => now()->subMinutes(10),
        'status' => StorageConnectionStatus::Connected,
    ]);

    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response([
            'access_token' => 'new-refreshed-access-token',
            'expires_in' => 3600,
        ], 200),
    ]);

    $service = app(GoogleDriveOAuthService::class);
    $result = $service->refreshToken($connection);

    expect($result)->toBeTrue();
    $connection->refresh();
    expect($connection->access_token)->toBe('new-refreshed-access-token')
        ->and($connection->isTokenExpired())->toBeFalse();
});

test('revoked refresh token updates status to reauthorization required', function () {
    $user = User::factory()->create();
    $connection = StorageConnection::create([
        'user_id' => $user->id,
        'provider' => 'google_drive',
        'provider_email' => 'user@gmail.com',
        'access_token' => 'old-token',
        'refresh_token' => 'revoked-refresh-token',
        'token_expires_at' => now()->subMinutes(10),
        'status' => StorageConnectionStatus::Connected,
    ]);

    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response([
            'error' => 'invalid_grant',
            'error_description' => 'Token has been expired or revoked.',
        ], 400),
    ]);

    $service = app(GoogleDriveOAuthService::class);
    $result = $service->refreshToken($connection);

    expect($result)->toBeFalse();
    $connection->refresh();
    expect($connection->status)->toBe(StorageConnectionStatus::ReauthorizationRequired);
});

test('disconnecting clears tokens and updates status without deleting user records', function () {
    $user = User::factory()->create();
    $connection = StorageConnection::create([
        'user_id' => $user->id,
        'provider' => 'google_drive',
        'provider_email' => 'user@gmail.com',
        'access_token' => 'test-token',
        'refresh_token' => 'test-refresh',
        'status' => StorageConnectionStatus::Connected,
    ]);

    Http::fake([
        'https://oauth2.googleapis.com/revoke' => Http::response([], 200),
    ]);

    $service = app(GoogleDriveOAuthService::class);
    $service->disconnect($connection);

    $connection->refresh();
    expect($connection->status)->toBe(StorageConnectionStatus::Disconnected)
        ->and($connection->access_token)->toBeNull()
        ->and($connection->refresh_token)->toBeNull();
});
