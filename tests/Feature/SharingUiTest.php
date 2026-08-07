<?php

use App\Enums\RelationshipStatus;
use App\Models\JournalEntry;
use App\Models\MemoryShare;
use App\Models\Relationship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('user can share memory with connected partner via web route', function () {
    $owner = User::factory()->create();
    $partner = User::factory()->create();

    $relationship = Relationship::factory()->create(['status' => RelationshipStatus::Active]);
    $relationship->members()->attach($owner->id, ['role' => 'partner']);
    $relationship->members()->attach($partner->id, ['role' => 'partner']);

    $entry = JournalEntry::factory()->create(['user_id' => $owner->id]);

    $response = $this->actingAs($owner)->post("/journal/{$entry->id}/share", [
        'target_user_id' => $partner->id,
        'permission' => 'view',
        'starts_at' => '2026-01-01',
        'ends_at' => '2026-12-31',
    ]);

    $response->assertRedirect("/journal/{$entry->id}");

    expect(MemoryShare::count())->toBe(1);
    $share = MemoryShare::first();
    expect($share->owner_id)->toBe($owner->id);
    expect($share->target_user_id)->toBe($partner->id);
    expect($share->starts_at->toDateString())->toBe('2026-01-01');
    expect($share->ends_at->toDateString())->toBe('2026-12-31');
});

test('user can revoke a memory share', function () {
    $owner = User::factory()->create();
    $partner = User::factory()->create();
    $entry = JournalEntry::factory()->create(['user_id' => $owner->id]);

    $share = MemoryShare::factory()->create([
        'owner_id' => $owner->id,
        'target_user_id' => $partner->id,
        'resource_type' => JournalEntry::class,
        'resource_id' => $entry->id,
        'revoked_at' => null,
    ]);

    $response = $this->actingAs($owner)->delete("/shares/{$share->id}");

    $response->assertRedirect("/journal/{$entry->id}");
    $share->refresh();
    expect($share->revoked_at)->not->toBeNull();
});

test('unauthorized user cannot revoke another users share', function () {
    $owner = User::factory()->create();
    $stranger = User::factory()->create();
    $partner = User::factory()->create();
    $entry = JournalEntry::factory()->create(['user_id' => $owner->id]);

    $share = MemoryShare::factory()->create([
        'owner_id' => $owner->id,
        'target_user_id' => $partner->id,
        'resource_type' => JournalEntry::class,
        'resource_id' => $entry->id,
    ]);

    $this->actingAs($stranger)->delete("/shares/{$share->id}")->assertForbidden();
});
