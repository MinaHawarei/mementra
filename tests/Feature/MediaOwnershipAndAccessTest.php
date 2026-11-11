<?php

use App\Enums\SharePermission;
use App\Enums\StorageConnectionStatus;
use App\Models\JournalEntry;
use App\Models\MemoryMedia;
use App\Models\MemoryShare;
use App\Models\SavedMedia;
use App\Models\StorageConnection;
use App\Models\User;
use App\Services\MediaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Config::set('services.google_drive.client_id', 'mock-client-id');
    Config::set('services.google_drive.client_secret', 'mock-secret');
    Storage::fake('local');
});

test('Scenario 1: User A uploads an image and is recorded as original owner with their storage connection', function () {
    $userA = User::factory()->create();

    $connectionA = StorageConnection::create([
        'user_id' => $userA->id,
        'provider' => 'google_drive',
        'provider_email' => 'userA@gmail.com',
        'access_token' => 'token-user-a',
        'refresh_token' => 'refresh-user-a',
        'token_expires_at' => now()->addHour(),
        'root_folder_id' => 'folder-root-a',
        'status' => StorageConnectionStatus::Connected,
    ]);

    Http::fake([
        'https://www.googleapis.com/upload/drive/v3/files*' => Http::response([
            'id' => 'drive-file-user-a-123',
            'name' => 'beach_sunset.jpg',
            'mimeType' => 'image/jpeg',
            'size' => 102400,
            'createdTime' => '2026-11-10T12:00:00Z',
        ], 200),
        'https://www.googleapis.com/drive/v3/files*' => Http::response([
            'id' => 'folder-sub-a',
            'files' => [],
        ], 200),
    ]);

    $file = UploadedFile::fake()->image('beach_sunset.jpg', 800, 600);
    $mediaService = app(MediaService::class);

    $media = $mediaService->uploadMedia($userA, $file);

    expect($media->user_id)->toBe($userA->id)
        ->and($media->storage_connection_id)->toBe($connectionA->id)
        ->and($media->storage_provider)->toBe('google_drive')
        ->and($media->provider_file_id)->toBe('drive-file-user-a-123')
        ->and($media->original_filename)->toBe('beach_sunset.jpg');
});

test('Scenario 2: User B views a shared memory containing User A image, but cannot modify or delete original', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();

    $entry = JournalEntry::factory()->create([
        'user_id' => $userA->id,
        'is_private' => false,
    ]);

    $media = MemoryMedia::factory()->create([
        'user_id' => $userA->id,
        'journal_entry_id' => $entry->id,
        'original_filename' => 'paris.jpg',
        'mime_type' => 'image/jpeg',
    ]);

    // Share entry with User B
    MemoryShare::create([
        'owner_id' => $userA->id,
        'resource_type' => 'journal_entry',
        'resource_id' => $entry->id,
        'target_user_id' => $userB->id,
        'permission' => SharePermission::View->value,
    ]);

    // User B CAN view
    expect($userB->can('view', $media))->toBeTrue();

    // User B CANNOT delete
    expect($userB->can('delete', $media))->toBeFalse();

    // User A (owner) CAN delete
    expect($userA->can('delete', $media))->toBeTrue();
});

test('Scenario 3: User B downloads User A image successfully without modifying ownership', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();

    $connectionA = StorageConnection::create([
        'user_id' => $userA->id,
        'provider' => 'google_drive',
        'access_token' => 'token-a',
        'refresh_token' => 'refresh-a',
        'token_expires_at' => now()->addHour(),
        'status' => StorageConnectionStatus::Connected,
    ]);

    $entry = JournalEntry::factory()->create(['user_id' => $userA->id, 'is_private' => false]);
    $media = MemoryMedia::factory()->create([
        'user_id' => $userA->id,
        'journal_entry_id' => $entry->id,
        'storage_connection_id' => $connectionA->id,
        'storage_provider' => 'google_drive',
        'provider_file_id' => 'drive-pic-456',
        'original_filename' => 'mountains.jpg',
        'mime_type' => 'image/jpeg',
        'size_bytes' => 1234,
    ]);

    MemoryShare::create([
        'owner_id' => $userA->id,
        'resource_type' => 'journal_entry',
        'resource_id' => $entry->id,
        'target_user_id' => $userB->id,
        'permission' => SharePermission::View->value,
    ]);

    Http::fake([
        'https://www.googleapis.com/drive/v3/files/drive-pic-456?alt=media' => Http::response('BINARY_IMAGE_DATA_123', 200, [
            'Content-Type' => 'image/jpeg',
        ]),
    ]);

    $response = $this->actingAs($userB)->get("/media/{$media->id}/download");

    $response->assertOk();
    $response->assertHeader('Content-Disposition', 'attachment; filename="mountains.jpg"');
    expect($response->getContent())->toBe('BINARY_IMAGE_DATA_123');

    // Ownership remains with User A
    $media->refresh();
    expect($media->user_id)->toBe($userA->id);
});

test('Scenario 4: User B saves User A image to their own Drive as an independent physical copy', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();

    $connectionA = StorageConnection::create([
        'user_id' => $userA->id,
        'provider' => 'google_drive',
        'access_token' => 'token-a',
        'refresh_token' => 'refresh-a',
        'token_expires_at' => now()->addHour(),
        'status' => StorageConnectionStatus::Connected,
    ]);

    $connectionB = StorageConnection::create([
        'user_id' => $userB->id,
        'provider' => 'google_drive',
        'access_token' => 'token-b',
        'refresh_token' => 'refresh-b',
        'token_expires_at' => now()->addHour(),
        'saved_folder_id' => 'user-b-saved-folder',
        'status' => StorageConnectionStatus::Connected,
    ]);

    $entry = JournalEntry::factory()->create(['user_id' => $userA->id, 'is_private' => false]);
    $mediaA = MemoryMedia::factory()->create([
        'user_id' => $userA->id,
        'journal_entry_id' => $entry->id,
        'storage_connection_id' => $connectionA->id,
        'storage_provider' => 'google_drive',
        'provider_file_id' => 'original-file-in-user-a-drive',
        'original_filename' => 'anniversary.jpg',
        'mime_type' => 'image/jpeg',
        'size_bytes' => 5000,
    ]);

    MemoryShare::create([
        'owner_id' => $userA->id,
        'resource_type' => 'journal_entry',
        'resource_id' => $entry->id,
        'target_user_id' => $userB->id,
        'permission' => SharePermission::View->value,
    ]);

    Http::fake([
        // Download from User A's Drive
        'https://www.googleapis.com/drive/v3/files/original-file-in-user-a-drive?alt=media' => Http::response('ANNIVERSARY_PHOTO_BYTES', 200),
        // Upload into User B's Drive
        'https://www.googleapis.com/upload/drive/v3/files*' => Http::response([
            'id' => 'independent-copy-in-user-b-drive',
            'name' => 'anniversary.jpg',
            'mimeType' => 'image/jpeg',
            'size' => 5000,
        ], 200),
    ]);

    $response = $this->actingAs($userB)->postJson("/media/{$mediaA->id}/save-to-drive");

    $response->assertOk();
    $response->assertJson(['success' => true]);

    // Independent record created in saved_media
    $savedRecord = SavedMedia::where('user_id', $userB->id)->where('original_media_id', $mediaA->id)->first();
    expect($savedRecord)->not->toBeNull()
        ->and($savedRecord->user_id)->toBe($userB->id)
        ->and($savedRecord->original_owner_id)->toBe($userA->id)
        ->and($savedRecord->storage_connection_id)->toBe($connectionB->id)
        ->and($savedRecord->provider_file_id)->toBe('independent-copy-in-user-b-drive')
        ->and($savedRecord->original_filename)->toBe('anniversary.jpg');
});

test('Scenario 5: User A deletes original image, but User B independently saved copy remains intact', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();

    $connectionB = StorageConnection::create([
        'user_id' => $userB->id,
        'provider' => 'google_drive',
        'access_token' => 'token-b',
        'status' => StorageConnectionStatus::Connected,
    ]);

    $mediaA = MemoryMedia::factory()->create([
        'user_id' => $userA->id,
        'storage_provider' => 'local',
        'provider_file_id' => 'mementra/user-1/temp.jpg',
    ]);

    $savedCopy = SavedMedia::create([
        'user_id' => $userB->id,
        'original_media_id' => $mediaA->id,
        'original_owner_id' => $userA->id,
        'storage_connection_id' => $connectionB->id,
        'provider' => 'google_drive',
        'provider_file_id' => 'independent-file-b-999',
        'original_filename' => 'saved_photo.jpg',
        'mime_type' => 'image/jpeg',
        'size_bytes' => 2048,
        'saved_at' => now(),
    ]);

    // User A deletes original media
    $mediaA->delete();

    // User B's saved copy is untouched and still valid
    $savedCopy->refresh();
    expect($savedCopy->exists)->toBeTrue()
        ->and($savedCopy->provider_file_id)->toBe('independent-file-b-999');
});

test('Scenario 6: User A disconnects Google Drive, original media is blocked, but User B copy remains accessible', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();

    $connectionA = StorageConnection::create([
        'user_id' => $userA->id,
        'provider' => 'google_drive',
        'access_token' => 'token-a',
        'refresh_token' => 'refresh-a',
        'status' => StorageConnectionStatus::Connected,
    ]);

    $connectionB = StorageConnection::create([
        'user_id' => $userB->id,
        'provider' => 'google_drive',
        'access_token' => 'token-b',
        'refresh_token' => 'refresh-b',
        'status' => StorageConnectionStatus::Connected,
    ]);

    $entry = JournalEntry::factory()->create(['user_id' => $userA->id, 'is_private' => false]);
    $mediaA = MemoryMedia::factory()->create([
        'user_id' => $userA->id,
        'journal_entry_id' => $entry->id,
        'storage_connection_id' => $connectionA->id,
        'storage_provider' => 'google_drive',
        'provider_file_id' => 'file-a',
    ]);

    MemoryShare::create([
        'owner_id' => $userA->id,
        'resource_type' => 'journal_entry',
        'resource_id' => $entry->id,
        'target_user_id' => $userB->id,
        'permission' => SharePermission::View->value,
    ]);

    $savedCopyB = SavedMedia::create([
        'user_id' => $userB->id,
        'original_media_id' => $mediaA->id,
        'original_owner_id' => $userA->id,
        'storage_connection_id' => $connectionB->id,
        'provider' => 'google_drive',
        'provider_file_id' => 'file-b-saved',
        'original_filename' => 'photo.jpg',
        'mime_type' => 'image/jpeg',
        'size_bytes' => 1000,
        'saved_at' => now(),
    ]);

    // User A disconnects their Google Drive
    $connectionA->disconnect();
    expect($connectionA->status)->toBe(StorageConnectionStatus::Disconnected);

    // Requesting original media fails or aborts because User A storage is disconnected
    $this->actingAs($userA)->get("/media/{$mediaA->id}/file")->assertNotFound();

    // User B requesting their saved copy succeeds
    Http::fake([
        'https://www.googleapis.com/drive/v3/files/file-b-saved?alt=media' => Http::response('SAVED_COPY_DATA', 200),
    ]);

    $response = $this->actingAs($userB)->get("/saved-media/{$savedCopyB->id}/file");
    $response->assertOk();
    expect($response->getContent())->toBe('SAVED_COPY_DATA');
});

test('Scenario 7: User C attempts to access an unauthorized memory image and access is denied', function () {
    $userA = User::factory()->create();
    $userC = User::factory()->create(); // Stranger

    $entry = JournalEntry::factory()->create(['user_id' => $userA->id, 'is_private' => true]);
    $mediaA = MemoryMedia::factory()->create([
        'user_id' => $userA->id,
        'journal_entry_id' => $entry->id,
        'storage_provider' => 'google_drive',
        'provider_file_id' => 'secret-google-drive-file-id-never-leak',
    ]);

    // User C is denied view
    $this->actingAs($userC)->get("/media/{$mediaA->id}/file")->assertForbidden();

    // User C is denied download
    $this->actingAs($userC)->get("/media/{$mediaA->id}/download")->assertForbidden();

    // User C is denied save to drive
    $this->actingAs($userC)->postJson("/media/{$mediaA->id}/save-to-drive")->assertForbidden();
});
