<?php

use App\Enums\StorageConnectionStatus;
use App\Models\StorageConnection;
use App\Models\User;
use App\Services\Storage\GoogleDriveOAuthService;
use Inertia\Testing\AssertableInertia as Assert;

test('guest is redirected to login when visiting integrations settings', function () {
    $this->get('/settings/integrations')
        ->assertRedirect('/login');
});

test('integrations page renders with null connection when user has no google drive connection', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/settings/integrations')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/integrations')
            ->where('connection', null)
        );
});

test('integrations page renders with connected connection data', function () {
    $user = User::factory()->create();

    StorageConnection::create([
        'user_id' => $user->id,
        'provider' => 'google_drive',
        'provider_account_id' => 'google-user-123',
        'provider_email' => 'partner@example.com',
        'access_token' => 'access-token-xyz',
        'refresh_token' => 'refresh-token-xyz',
        'token_expires_at' => now()->addHour(),
        'status' => StorageConnectionStatus::Connected,
        'connected_at' => now()->subDays(5),
        'last_verified_at' => now(),
    ]);

    $this->actingAs($user)
        ->get('/settings/integrations')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/integrations')
            ->where('connection.provider', 'google_drive')
            ->where('connection.provider_email', 'partner@example.com')
            ->where('connection.status', 'connected')
            ->where('connection.is_connected', true)
        );
});

test('integrations page displays reauthorization required state when token is expired or invalid', function () {
    $user = User::factory()->create();

    StorageConnection::create([
        'user_id' => $user->id,
        'provider' => 'google_drive',
        'provider_account_id' => 'google-user-123',
        'provider_email' => 'partner@example.com',
        'access_token' => 'expired-token',
        'refresh_token' => 'refresh-token-xyz',
        'token_expires_at' => now()->subDay(),
        'status' => StorageConnectionStatus::ReauthorizationRequired,
        'connected_at' => now()->subDays(10),
    ]);

    $this->actingAs($user)
        ->get('/settings/integrations')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/integrations')
            ->where('connection.status', 'reauthorization_required')
            ->where('connection.is_connected', false)
        );
});

test('disconnecting google drive updates connection status and redirects', function () {
    $user = User::factory()->create();

    $connection = StorageConnection::create([
        'user_id' => $user->id,
        'provider' => 'google_drive',
        'provider_account_id' => 'google-user-123',
        'provider_email' => 'partner@example.com',
        'access_token' => 'access-token-xyz',
        'refresh_token' => 'refresh-token-xyz',
        'status' => StorageConnectionStatus::Connected,
    ]);

    $this->actingAs($user)
        ->delete('/integrations/google-drive/disconnect')
        ->assertRedirect(route('integrations.index'))
        ->assertSessionHas('success');

    $connection->refresh();
    expect($connection->status)->toBe(StorageConnectionStatus::Disconnected)
        ->and($connection->access_token)->toBeNull()
        ->and($connection->refresh_token)->toBeNull();
});

test('test connection endpoint verifies storage connection', function () {
    $user = User::factory()->create();

    StorageConnection::create([
        'user_id' => $user->id,
        'provider' => 'google_drive',
        'provider_account_id' => 'google-user-123',
        'provider_email' => 'partner@example.com',
        'access_token' => 'access-token-xyz',
        'refresh_token' => 'refresh-token-xyz',
        'status' => StorageConnectionStatus::Connected,
    ]);

    $this->mock(GoogleDriveOAuthService::class, function ($mock) {
        $mock->shouldReceive('testConnection')
            ->once()
            ->andReturn(['success' => true, 'message' => 'Google Drive connection is healthy!']);
    });

    $this->actingAs($user)
        ->post('/integrations/google-drive/test')
        ->assertRedirect()
        ->assertSessionHas('success', 'Google Drive connection is healthy!');
});
