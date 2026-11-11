<?php

use App\Enums\StorageConnectionStatus;
use App\Models\StorageConnection;
use App\Models\User;
use App\Services\Storage\GoogleDriveOAuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Session;

uses(RefreshDatabase::class);

beforeEach(function () {
    Config::set('services.google_drive.client_id', 'mock-google-client-id.apps.googleusercontent.com');
    Config::set('services.google_drive.client_secret', 'mock-google-client-secret');
    Config::set('services.google_drive.redirect_uri', 'http://localhost/integrations/google-drive/callback');
    Config::set('services.google_drive.auth_redirect_uri', 'http://localhost/auth/google/callback');
});

test('redirect endpoint initiates unified google oauth with least privilege drive scope and state token', function () {
    $response = $this->get(route('auth.google.redirect'));

    $response->assertRedirect();
    $targetUrl = $response->headers->get('Location');

    expect($targetUrl)->toContain('https://accounts.google.com/o/oauth2/v2/auth')
        ->and($targetUrl)->toContain('client_id=mock-google-client-id.apps.googleusercontent.com')
        ->and($targetUrl)->toContain(urlencode(GoogleDriveOAuthService::DRIVE_FILE_SCOPE))
        ->and($targetUrl)->toContain('access_type=offline')
        ->and($targetUrl)->toContain('prompt=select_account+consent')
        ->and($targetUrl)->toContain('include_granted_scopes=true');

    expect(Session::has('google_auth_oauth_state'))->toBeTrue();
});

test('scenario a: new user signs up with google, creates account and connects google drive automatically', function () {
    $service = app(GoogleDriveOAuthService::class);
    $service->getAuthAuthorizationUrl();
    $state = Session::get('google_auth_oauth_state');

    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response([
            'access_token' => 'mock-google-access-token',
            'refresh_token' => 'mock-google-refresh-token',
            'expires_in' => 3600,
            'token_type' => 'Bearer',
            'scope' => 'openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.file',
        ], 200),
        'https://www.googleapis.com/oauth2/v3/userinfo' => Http::response([
            'sub' => 'google-user-id-1001',
            'email' => 'newcouples@gmail.com',
            'name' => 'Sarah & John',
            'email_verified' => true,
            'picture' => 'https://lh3.googleusercontent.com/avatar-sarah.jpg',
        ], 200),
        'https://www.googleapis.com/drive/v3/files*' => Http::response([
            'id' => 'mock-mementra-folder-id',
            'name' => 'Mementra',
            'files' => [],
        ], 200),
    ]);

    $response = $this->get(route('auth.google.callback', [
        'code' => 'valid-auth-code',
        'state' => $state,
    ]));

    $response->assertRedirect(route('dashboard'));
    $response->assertSessionHas('success');

    // 1. User created
    $user = User::where('email', 'newcouples@gmail.com')->first();
    expect($user)->not->toBeNull()
        ->and($user->google_id)->toBe('google-user-id-1001')
        ->and($user->name)->toBe('Sarah & John')
        ->and($user->google_avatar)->toBe('https://lh3.googleusercontent.com/avatar-sarah.jpg')
        ->and($user->email_verified_at)->not->toBeNull();

    // 2. User authenticated
    expect(Auth::id())->toBe($user->id);

    // 3. StorageConnection established
    $connection = StorageConnection::where('user_id', $user->id)->first();
    expect($connection)->not->toBeNull()
        ->and($connection->provider)->toBe('google_drive')
        ->and($connection->provider_account_id)->toBe('google-user-id-1001')
        ->and($connection->provider_email)->toBe('newcouples@gmail.com')
        ->and($connection->status)->toBe(StorageConnectionStatus::Connected)
        ->and($connection->isConnected())->toBeTrue()
        ->and($connection->access_token)->toBe('mock-google-access-token')
        ->and($connection->refresh_token)->toBe('mock-google-refresh-token');

    // 4. Tokens encrypted at rest
    $raw = DB::table('storage_connections')->where('id', $connection->id)->first();
    expect($raw->access_token)->not->toBe('mock-google-access-token')
        ->and($raw->refresh_token)->not->toBe('mock-google-refresh-token');
});

test('scenario b: existing google user signs in and reuses or restores drive connection', function () {
    $user = User::factory()->create([
        'email' => 'existing@gmail.com',
        'google_id' => 'google-user-id-2002',
    ]);

    $existingConnection = StorageConnection::create([
        'user_id' => $user->id,
        'provider' => 'google_drive',
        'provider_account_id' => 'google-user-id-2002',
        'provider_email' => 'existing@gmail.com',
        'access_token' => 'old-access-token',
        'refresh_token' => 'permanent-refresh-token',
        'status' => StorageConnectionStatus::Connected,
        'root_folder_id' => 'existing-root-folder',
        'saved_folder_id' => 'existing-saved-folder',
    ]);

    $service = app(GoogleDriveOAuthService::class);
    $service->getAuthAuthorizationUrl();
    $state = Session::get('google_auth_oauth_state');

    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response([
            'access_token' => 'new-rotated-access-token',
            'expires_in' => 3600,
            'token_type' => 'Bearer',
            'scope' => 'openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.file',
        ], 200),
        'https://www.googleapis.com/oauth2/v3/userinfo' => Http::response([
            'sub' => 'google-user-id-2002',
            'email' => 'existing@gmail.com',
            'name' => 'Existing User',
            'email_verified' => true,
        ], 200),
        'https://www.googleapis.com/drive/v3/files*' => Http::response([
            'id' => 'existing-root-folder',
            'trashed' => false,
        ], 200),
    ]);

    $response = $this->get(route('auth.google.callback', [
        'code' => 'login-auth-code',
        'state' => $state,
    ]));

    $response->assertRedirect(route('dashboard'));
    expect(Auth::id())->toBe($user->id);

    $existingConnection->refresh();
    expect($existingConnection->access_token)->toBe('new-rotated-access-token')
        ->and($existingConnection->refresh_token)->toBe('permanent-refresh-token')
        ->and($existingConnection->isConnected())->toBeTrue();
});

test('scenario c1: existing email/password user safely links google account when email is verified', function () {
    $user = User::factory()->create([
        'email' => 'sharedmemories@example.com',
        'google_id' => null,
        'password' => 'secret123',
    ]);

    $service = app(GoogleDriveOAuthService::class);
    $service->getAuthAuthorizationUrl();
    $state = Session::get('google_auth_oauth_state');

    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response([
            'access_token' => 'linked-access-token',
            'refresh_token' => 'linked-refresh-token',
            'expires_in' => 3600,
            'scope' => 'openid https://www.googleapis.com/auth/drive.file',
        ], 200),
        'https://www.googleapis.com/oauth2/v3/userinfo' => Http::response([
            'sub' => 'google-linked-id-3003',
            'email' => 'sharedmemories@example.com',
            'email_verified' => true,
            'name' => 'Linked User',
            'picture' => 'https://example.com/new-pic.jpg',
        ], 200),
        'https://www.googleapis.com/drive/v3/files*' => Http::response([
            'id' => 'folder-123',
            'name' => 'Mementra',
            'files' => [],
        ], 200),
    ]);

    $response = $this->get(route('auth.google.callback', [
        'code' => 'link-code',
        'state' => $state,
    ]));

    $response->assertRedirect(route('dashboard'));
    expect(Auth::id())->toBe($user->id);

    $user->refresh();
    expect($user->google_id)->toBe('google-linked-id-3003')
        ->and($user->google_avatar)->toBe('https://example.com/new-pic.jpg');

    $connection = StorageConnection::where('user_id', $user->id)->first();
    expect($connection)->not->toBeNull()
        ->and($connection->isConnected())->toBeTrue();
});

test('scenario c2: account linking is rejected when google account email is unverified', function () {
    $user = User::factory()->create([
        'email' => 'victim@example.com',
        'google_id' => null,
    ]);

    $service = app(GoogleDriveOAuthService::class);
    $service->getAuthAuthorizationUrl();
    $state = Session::get('google_auth_oauth_state');

    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response([
            'access_token' => 'unverified-token',
            'scope' => 'openid email',
        ], 200),
        'https://www.googleapis.com/oauth2/v3/userinfo' => Http::response([
            'sub' => 'malicious-attacker-sub',
            'email' => 'victim@example.com',
            'email_verified' => false, // Unverified Google email!
        ], 200),
    ]);

    $response = $this->get(route('auth.google.callback', [
        'code' => 'malicious-code',
        'state' => $state,
    ]));

    $response->assertRedirect(route('login'));
    $response->assertSessionHas('error');

    // Victim account MUST NOT be linked or logged in
    $user->refresh();
    expect($user->google_id)->toBeNull();
    expect(Auth::check())->toBeFalse();
});

test('scenario d: user signs in with google but declines drive permission', function () {
    $service = app(GoogleDriveOAuthService::class);
    $service->getAuthAuthorizationUrl();
    $state = Session::get('google_auth_oauth_state');

    // Google returns identity scope only, drive.file was unchecked by user
    Http::fake([
        'https://oauth2.googleapis.com/token' => Http::response([
            'access_token' => 'identity-only-token',
            'expires_in' => 3600,
            'scope' => 'openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        ], 200),
        'https://www.googleapis.com/oauth2/v3/userinfo' => Http::response([
            'sub' => 'google-user-no-drive',
            'email' => 'nodrive@gmail.com',
            'name' => 'No Drive User',
            'email_verified' => true,
        ], 200),
    ]);

    $response = $this->get(route('auth.google.callback', [
        'code' => 'no-drive-code',
        'state' => $state,
    ]));

    $response->assertRedirect(route('dashboard'));
    $response->assertSessionHas('warning');

    $user = User::where('email', 'nodrive@gmail.com')->first();
    expect($user)->not->toBeNull();
    expect(Auth::id())->toBe($user->id);

    // Connection must be recorded as ReauthorizationRequired
    $connection = StorageConnection::where('user_id', $user->id)->first();
    expect($connection)->not->toBeNull()
        ->and($connection->status)->toBe(StorageConnectionStatus::ReauthorizationRequired)
        ->and($connection->isConnected())->toBeFalse();
});

test('google oauth callback rejects invalid csrf state token', function () {
    $response = $this->get(route('auth.google.callback', [
        'code' => 'any-code',
        'state' => 'forged-state-token',
    ]));

    $response->assertRedirect(route('login'));
    $response->assertSessionHas('error');
    expect(Auth::check())->toBeFalse();
});

test('google oauth callback handles access denied or cancellation from user', function () {
    $response = $this->get(route('auth.google.callback', [
        'error' => 'access_denied',
    ]));

    $response->assertRedirect(route('login'));
    $response->assertSessionHas('error', 'Google sign-in was cancelled.');
    expect(Auth::check())->toBeFalse();
});

test('settings connect google drive endpoint redirects away with valid authorization url', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('integrations.google-drive.redirect'));

    $response->assertRedirect();
    $targetUrl = $response->headers->get('Location');

    expect($targetUrl)->toContain('https://accounts.google.com/o/oauth2/v2/auth')
        ->and($targetUrl)->toContain('client_id=mock-google-client-id.apps.googleusercontent.com')
        ->and($targetUrl)->toContain(urlencode(GoogleDriveOAuthService::DRIVE_FILE_SCOPE));
});
