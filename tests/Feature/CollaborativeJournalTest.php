<?php

use App\Enums\SharePermission;
use App\Models\JournalEntry;
use App\Models\MemoryShare;
use App\Models\User;
use App\Services\JournalEntryService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('partner with collaborate share permission can update a shared entry', function () {
    $owner = User::factory()->create();
    $partner = User::factory()->create();

    $entry = JournalEntry::factory()->create(['user_id' => $owner->id, 'title' => 'Original Title']);

    MemoryShare::factory()->create([
        'owner_id' => $owner->id,
        'target_user_id' => $partner->id,
        'resource_type' => 'journal_entry',
        'resource_id' => $entry->id,
        'permission' => SharePermission::Collaborate,
    ]);

    $response = $this->actingAs($partner)->put("/journal/{$entry->id}", [
        'title' => 'Updated by Partner',
        'blocks' => [
            ['type' => 'text', 'content_json' => ['text' => 'Added partner thoughts']],
        ],
    ]);

    $response->assertRedirect("/journal/{$entry->id}");
    expect($entry->fresh()->title)->toBe('Updated by Partner');
});

test('unauthorized partner without collaborate permission cannot update entry', function () {
    $owner = User::factory()->create();
    $partner = User::factory()->create();

    $entry = JournalEntry::factory()->create(['user_id' => $owner->id]);

    MemoryShare::factory()->create([
        'owner_id' => $owner->id,
        'target_user_id' => $partner->id,
        'resource_type' => 'journal_entry',
        'resource_id' => $entry->id,
        'permission' => SharePermission::View,
    ]);

    $this->actingAs($partner)->put("/journal/{$entry->id}", [
        'title' => 'Hacked Title',
    ])->assertForbidden();
});

test('contributor identity is preserved per block', function () {
    $owner = User::factory()->create();
    $service = app(JournalEntryService::class);

    $entry = $service->createEntry($owner, [
        'title' => 'Shared Memory',
        'blocks' => [
            ['type' => 'text', 'content_json' => ['text' => 'Owner notes']],
        ],
    ]);

    expect($entry->blocks->first()->created_by)->toBe($owner->id);
});
