<?php

use App\Models\MemoryMedia;
use App\Models\User;
use App\Services\MediaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('local');
});

test('media serving returns 200 with proper content-type, content-length and cache-control headers', function () {
    $user = User::factory()->create();
    $file = UploadedFile::fake()->image('test_sunset.jpg', 640, 480);

    $mediaService = app(MediaService::class);
    $media = $mediaService->uploadMedia($user, $file);

    $response = $this->actingAs($user)->get("/media/{$media->id}/file");

    $response->assertOk();
    $response->assertHeader('Content-Type', 'image/jpeg');
    $response->assertHeader('Content-Disposition', 'inline; filename="test_sunset.jpg"');
    $response->assertHeader('Cache-Control', 'max-age=86400, private');
    expect($response->headers->get('Content-Length'))->not->toBeNull()
        ->and((int) $response->headers->get('Content-Length'))->toBeGreaterThan(0);
});

test('media serving returns 404 if file cannot be retrieved from storage', function () {
    $user = User::factory()->create();
    $media = MemoryMedia::factory()->create([
        'user_id' => $user->id,
        'storage_provider' => 'local',
        'provider_file_id' => 'non_existent_path.jpg',
    ]);

    $this->actingAs($user)->get("/media/{$media->id}/file")->assertNotFound();
});

test('memories index loads and includes url and download_url in resource', function () {
    $user = User::factory()->create();
    $file = UploadedFile::fake()->image('photo_1.jpg');
    app(MediaService::class)->uploadMedia($user, $file);

    $response = $this->actingAs($user)->get('/memories');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('memories/index')
        ->has('mediaItems.data', 1)
        ->has('hasGoogleDrive')
        ->has('savedMediaIds')
    );
});
