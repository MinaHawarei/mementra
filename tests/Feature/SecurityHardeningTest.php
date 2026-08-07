<?php

use App\Models\JournalEntry;
use App\Models\MemoryMedia;
use App\Models\MemoryShare;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('private media file cannot be downloaded by unauthorized user', function () {
    $owner = User::factory()->create();
    $stranger = User::factory()->create();

    $media = MemoryMedia::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($stranger)->get("/media/{$media->id}/file")->assertForbidden();
});

test('revoked memory share denies access to target user', function () {
    $owner = User::factory()->create();
    $target = User::factory()->create();

    $entry = JournalEntry::factory()->create(['user_id' => $owner->id, 'is_private' => true]);

    MemoryShare::factory()->create([
        'owner_id' => $owner->id,
        'target_user_id' => $target->id,
        'resource_type' => 'journal_entry',
        'resource_id' => $entry->id,
        'revoked_at' => now()->subHour(),
    ]);

    $this->actingAs($target)->get("/journal/{$entry->id}")->assertForbidden();
});

test('expired memory share denies access to target user', function () {
    $owner = User::factory()->create();
    $target = User::factory()->create();

    $entry = JournalEntry::factory()->create(['user_id' => $owner->id, 'is_private' => true]);

    MemoryShare::factory()->create([
        'owner_id' => $owner->id,
        'target_user_id' => $target->id,
        'resource_type' => 'journal_entry',
        'resource_id' => $entry->id,
        'ends_at' => now()->subDay(),
    ]);

    $this->actingAs($target)->get("/journal/{$entry->id}")->assertForbidden();
});

test('api endpoints throttle excessive requests', function () {
    $user = User::factory()->create();

    for ($i = 0; $i < 60; $i++) {
        $this->actingAs($user)->getJson('/api/v1/me');
    }

    $response = $this->actingAs($user)->getJson('/api/v1/me');
    $response->assertStatus(429);
});
