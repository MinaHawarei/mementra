<?php

use App\Models\JournalEntry;
use App\Models\MemoryMedia;
use App\Models\User;
use App\Services\JournalEntryService;
use App\Services\MediaService;
use App\Services\Storage\LocalTestMediaStorage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('local');
});

test('image media can be attached to a journal entry via service', function () {
    $user = User::factory()->create();
    $storage = new LocalTestMediaStorage;
    $mediaService = new MediaService($storage);
    $service = new JournalEntryService($mediaService);

    $file = UploadedFile::fake()->image('sunset.jpg', 800, 600);

    $entry = $service->createEntry($user, [
        'title' => 'Sunset at the beach',
        'entry_date' => '2026-01-15',
        'blocks' => [['type' => 'text', 'content_json' => ['text' => 'Beautiful sunset']]],
        'images' => [$file],
    ]);

    expect($entry->media)->toHaveCount(1);
    expect($entry->media->first()->original_filename)->toBe('sunset.jpg');
    expect($entry->media->first()->width)->toBe(800);
    expect($entry->media->first()->height)->toBe(600);
    expect($entry->media->first()->journal_entry_id)->toBe($entry->id);
});

test('multiple images can be attached to a journal entry', function () {
    $user = User::factory()->create();
    $storage = new LocalTestMediaStorage;
    $mediaService = new MediaService($storage);
    $service = new JournalEntryService($mediaService);

    $files = [
        UploadedFile::fake()->image('photo1.jpg', 400, 300),
        UploadedFile::fake()->image('photo2.png', 1024, 768),
        UploadedFile::fake()->image('photo3.jpg', 640, 480),
    ];

    $entry = $service->createEntry($user, [
        'title' => 'Multiple photos',
        'images' => $files,
    ]);

    expect($entry->media)->toHaveCount(3);
});

test('image can be removed from a journal entry', function () {
    $user = User::factory()->create();
    $storage = new LocalTestMediaStorage;
    $mediaService = new MediaService($storage);

    $entry = JournalEntry::factory()->create(['user_id' => $user->id]);
    $file = UploadedFile::fake()->image('delete_me.jpg');
    $media = $mediaService->uploadMedia($user, $file, $entry->id);

    expect(MemoryMedia::count())->toBe(1);

    $mediaService->deleteMedia($media);

    expect(MemoryMedia::count())->toBe(0);
});

test('memories gallery page loads for authenticated user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/memories');

    $response->assertOk();
});

test('gallery groups media by year and month', function () {
    $user = User::factory()->create();
    MemoryMedia::factory()->count(3)->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->get('/memories');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('memories/index')
        ->has('mediaItems.data')
    );
});

test('gallery supports year filtering', function () {
    $user = User::factory()->create();
    MemoryMedia::factory()->create(['user_id' => $user->id, 'created_at' => '2026-03-15']);
    MemoryMedia::factory()->create(['user_id' => $user->id, 'created_at' => '2025-06-01']);

    $response = $this->actingAs($user)->get('/memories?year=2026');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('memories/index')
        ->has('mediaItems.data', 1)
    );
});

test('secure media serving requires authentication', function () {
    $user = User::factory()->create();
    $media = MemoryMedia::factory()->create(['user_id' => $user->id]);

    $this->get("/media/{$media->id}/file")->assertRedirect();
});

test('secure media serving denies access to unauthorized users', function () {
    $owner = User::factory()->create();
    $stranger = User::factory()->create();
    $media = MemoryMedia::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($stranger)->get("/media/{$media->id}/file")->assertForbidden();
});
