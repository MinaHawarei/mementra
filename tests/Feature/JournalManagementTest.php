<?php

use App\Enums\BlockType;
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

test('journal show page returns entry with plain unwrapped array of blocks and media', function () {
    $user = User::factory()->create();
    $entry = JournalEntry::factory()->create(['user_id' => $user->id, 'title' => 'Trip to Kyoto']);

    $entry->blocks()->create([
        'type' => BlockType::Text,
        'position' => 0,
        'content_json' => ['text' => 'Walking through the bamboo grove.'],
        'created_by' => $user->id,
    ]);

    $media = MemoryMedia::factory()->create([
        'user_id' => $user->id,
        'journal_entry_id' => $entry->id,
        'original_filename' => 'kyoto.jpg',
    ]);

    $response = $this->actingAs($user)->get("/journal/{$entry->id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('journal/show')
        ->has('entry', fn ($e) => $e
            ->where('id', $entry->id)
            ->where('title', 'Trip to Kyoto')
            ->has('blocks', 1)
            ->where('blocks.0.content.text', 'Walking through the bamboo grove.')
            ->has('media', 1)
            ->where('media.0.id', $media->id)
            ->where('media.0.original_filename', 'kyoto.jpg')
            ->etc()
        )
    );
});

test('journal edit page returns entry with unwrapped blocks and existing media', function () {
    $user = User::factory()->create();
    $entry = JournalEntry::factory()->create(['user_id' => $user->id, 'title' => 'Stargazing Night']);

    $entry->blocks()->create([
        'type' => BlockType::Text,
        'position' => 0,
        'content_json' => ['text' => 'Clear skies and meteor showers.'],
        'created_by' => $user->id,
    ]);

    $media = MemoryMedia::factory()->create([
        'user_id' => $user->id,
        'journal_entry_id' => $entry->id,
        'original_filename' => 'telescope.jpg',
    ]);

    $response = $this->actingAs($user)->get("/journal/{$entry->id}/edit");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('journal/edit')
        ->has('entry', fn ($e) => $e
            ->where('id', $entry->id)
            ->has('blocks', 1)
            ->where('blocks.0.content.text', 'Clear skies and meteor showers.')
            ->has('media', 1)
            ->where('media.0.id', $media->id)
            ->etc()
        )
    );
});

test('detaching media removes association from journal entry without deleting file or media record', function () {
    $user = User::factory()->create();
    $entry = JournalEntry::factory()->create(['user_id' => $user->id]);

    $media1 = MemoryMedia::factory()->create([
        'user_id' => $user->id,
        'journal_entry_id' => $entry->id,
        'original_filename' => 'keep_this.jpg',
    ]);

    $media2 = MemoryMedia::factory()->create([
        'user_id' => $user->id,
        'journal_entry_id' => $entry->id,
        'original_filename' => 'detach_this.jpg',
    ]);

    $response = $this->actingAs($user)->put("/journal/{$entry->id}", [
        'title' => 'Updated Title',
        'detached_media_ids' => [$media2->id],
        'keep_media_ids' => [$media1->id],
        'blocks' => [
            ['type' => 'text', 'content_json' => ['text' => 'Story continues...']],
        ],
    ]);

    $response->assertRedirect("/journal/{$entry->id}");

    // media1 is still attached to entry
    expect($media1->fresh()->journal_entry_id)->toBe($entry->id);

    // media2 is detached (journal_entry_id = null)
    expect($media2->fresh()->journal_entry_id)->toBeNull();

    // media2 is NOT deleted from database (preserves photo in gallery)
    expect(MemoryMedia::where('id', $media2->id)->exists())->toBeTrue();
});

test('adding new images during edit preserves existing non-detached images', function () {
    $user = User::factory()->create();
    $storage = new LocalTestMediaStorage;
    $mediaService = new MediaService($storage);
    $service = new JournalEntryService($mediaService);

    $entry = $service->createEntry($user, [
        'title' => 'Mountain Hike',
        'images' => [UploadedFile::fake()->image('peak.jpg', 600, 400)],
    ]);

    expect($entry->media)->toHaveCount(1);
    $firstMediaId = $entry->media->first()->id;

    $newFile = UploadedFile::fake()->image('valley.jpg', 800, 600);

    $service->updateEntry($entry, [
        'title' => 'Mountain Hike & Valley',
        'images' => [$newFile],
    ], $user);

    $entry->refresh();
    expect($entry->media)->toHaveCount(2);
    expect($entry->media->pluck('id')->all())->toContain($firstMediaId);
});

test('deduplication prevents uploading or attaching the same file twice to the same entry', function () {
    $user = User::factory()->create();
    $storage = new LocalTestMediaStorage;
    $mediaService = new MediaService($storage);
    $service = new JournalEntryService($mediaService);

    $file = UploadedFile::fake()->image('repeat.jpg', 500, 500);

    $entry = $service->createEntry($user, [
        'title' => 'Deduplication Test',
        'images' => [$file, $file], // same file sent twice in initial creation
    ]);

    // Should only be attached once
    expect($entry->media)->toHaveCount(1);

    // Now update with the same file again
    $sameFileAgain = UploadedFile::fake()->image('repeat.jpg', 500, 500);
    $service->updateEntry($entry, [
        'images' => [$sameFileAgain],
    ], $user);

    $entry->refresh();
    expect($entry->media)->toHaveCount(1);
});

test('deduplication cleans up duplicate identical blocks and assigns consecutive positions', function () {
    $user = User::factory()->create();
    $service = app(JournalEntryService::class);

    $entry = $service->createEntry($user, [
        'title' => 'Block Test',
        'blocks' => [
            ['type' => 'text', 'content_json' => ['text' => 'First paragraph']],
            ['type' => 'text', 'content_json' => ['text' => 'First paragraph']], // duplicate
            ['type' => 'quote', 'content_json' => ['text' => 'Cherish every moment', 'author' => 'Anonymous']],
            ['type' => 'quote', 'content_json' => ['text' => 'Cherish every moment', 'author' => 'Anonymous']], // duplicate
            ['type' => 'text', 'content_json' => ['text' => 'Final paragraph']],
        ],
    ]);

    $blocks = $entry->blocks()->orderBy('position')->get();

    expect($blocks)->toHaveCount(3);
    expect($blocks[0]->position)->toBe(0);
    expect($blocks[0]->content_json['text'])->toBe('First paragraph');
    expect($blocks[1]->position)->toBe(1);
    expect($blocks[1]->type->value)->toBe('quote');
    expect($blocks[2]->position)->toBe(2);
    expect($blocks[2]->content_json['text'])->toBe('Final paragraph');
});

test('string content_json or content is normalized into array structure', function () {
    $user = User::factory()->create();
    $service = app(JournalEntryService::class);

    $entry = $service->createEntry($user, [
        'title' => 'String Content Test',
        'blocks' => [
            ['type' => 'text', 'content_json' => 'Simple string content'],
        ],
    ]);

    $block = $entry->blocks->first();
    expect($block->content_json)->toBe(['text' => 'Simple string content']);
});
