<?php

use App\Models\MemoryMedia;
use App\Models\User;
use App\Services\MediaService;
use App\Services\Storage\LocalTestMediaStorage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('local');
});

test('LocalTestMediaStorage uploads and retrieves file contents', function () {
    $storage = new LocalTestMediaStorage;
    $result = $storage->upload('test.txt', 'Hello Mementra', 'text/plain');

    expect($result->fileId)->toBe('test.txt')
        ->and($storage->exists('test.txt'))->toBeTrue()
        ->and($storage->download('test.txt'))->toBe('Hello Mementra');

    $storage->delete('test.txt');
    expect($storage->exists('test.txt'))->toBeFalse();
});

test('MediaService uploads file and creates database record', function () {
    $user = User::factory()->create();
    $storage = new LocalTestMediaStorage;
    $service = new MediaService($storage);

    $file = UploadedFile::fake()->image('photo.jpg', 600, 400);

    $media = $service->uploadMedia($user, $file);

    expect($media->user_id)->toBe($user->id)
        ->and($media->original_filename)->toBe('photo.jpg')
        ->and($media->width)->toBe(600)
        ->and($media->height)->toBe(400);

    expect($service->getMediaContents($media))->not->toBeEmpty();

    $service->deleteMedia($media);
    expect(MemoryMedia::count())->toBe(0);
});
