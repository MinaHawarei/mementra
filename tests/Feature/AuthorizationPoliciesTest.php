<?php

use App\Enums\SharePermission;
use App\Models\JournalEntry;
use App\Models\MemoryMedia;
use App\Models\MemoryShare;
use App\Models\Relationship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('user can view owned journal entry', function () {
    $user = User::factory()->create();
    $entry = JournalEntry::factory()->create(['user_id' => $user->id]);

    expect($user->can('view', $entry))->toBeTrue()
        ->and($user->can('update', $entry))->toBeTrue()
        ->and($user->can('delete', $entry))->toBeTrue();
});

test('user cannot view private journal entry of another user', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $entry = JournalEntry::factory()->create(['user_id' => $owner->id, 'is_private' => true]);

    expect($otherUser->can('view', $entry))->toBeFalse()
        ->and($otherUser->can('update', $entry))->toBeFalse();
});

test('user can view shared journal entry when share is valid', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $entry = JournalEntry::factory()->create(['user_id' => $owner->id, 'is_private' => false]);

    MemoryShare::factory()->create([
        'resource_type' => 'journal_entry',
        'resource_id' => $entry->id,
        'owner_id' => $owner->id,
        'target_user_id' => $otherUser->id,
        'permission' => SharePermission::View,
        'starts_at' => now()->subDay(),
        'ends_at' => now()->addDay(),
        'revoked_at' => null,
    ]);

    expect($otherUser->can('view', $entry))->toBeTrue()
        ->and($otherUser->can('update', $entry))->toBeFalse();
});

test('user can update shared journal entry if permission is collaborate', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $entry = JournalEntry::factory()->create(['user_id' => $owner->id]);

    MemoryShare::factory()->create([
        'resource_type' => 'journal_entry',
        'resource_id' => $entry->id,
        'owner_id' => $owner->id,
        'target_user_id' => $otherUser->id,
        'permission' => SharePermission::Collaborate,
    ]);

    expect($otherUser->can('update', $entry))->toBeTrue();
});

test('revoked share denies access to journal entry', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $entry = JournalEntry::factory()->create(['user_id' => $owner->id]);

    MemoryShare::factory()->create([
        'resource_type' => 'journal_entry',
        'resource_id' => $entry->id,
        'owner_id' => $owner->id,
        'target_user_id' => $otherUser->id,
        'permission' => SharePermission::View,
        'revoked_at' => now()->subMinute(),
    ]);

    expect($otherUser->can('view', $entry))->toBeFalse();
});

test('media policy respects journal entry policy', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $entry = JournalEntry::factory()->create(['user_id' => $owner->id]);
    $media = MemoryMedia::factory()->create([
        'user_id' => $owner->id,
        'journal_entry_id' => $entry->id,
    ]);

    expect($otherUser->can('view', $media))->toBeFalse();

    MemoryShare::factory()->create([
        'resource_type' => 'journal_entry',
        'resource_id' => $entry->id,
        'owner_id' => $owner->id,
        'target_user_id' => $otherUser->id,
        'permission' => SharePermission::View,
    ]);

    expect($otherUser->can('view', $media))->toBeTrue();
});

test('relationship member can view relationship', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $nonMember = User::factory()->create();

    $rel = Relationship::factory()->create(['created_by' => $user1->id]);
    $rel->members()->attach([$user1->id, $user2->id]);

    expect($user1->can('view', $rel))->toBeTrue()
        ->and($user2->can('view', $rel))->toBeTrue()
        ->and($nonMember->can('view', $rel))->toBeFalse();
});
