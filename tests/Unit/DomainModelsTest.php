<?php

use App\Enums\Locale;
use App\Enums\Mood;
use App\Enums\RelationshipRole;
use App\Enums\RelationshipStatus;
use App\Enums\RelationshipType;
use App\Enums\SharePermission;
use App\Models\Event;
use App\Models\JournalBlock;
use App\Models\JournalEntry;
use App\Models\MemoryMedia;
use App\Models\MemoryShare;
use App\Models\Relationship;
use App\Models\Reminder;
use App\Models\TimelineEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('user has default locale and timezone and relationships', function () {
    $user = User::factory()->create([
        'locale' => Locale::AR,
        'timezone' => 'Africa/Cairo',
    ]);

    expect($user->locale)->toBe(Locale::AR)
        ->and($user->timezone)->toBe('Africa/Cairo');
});

test('relationship connects users and has creator and members', function () {
    $creator = User::factory()->create();
    $partner = User::factory()->create();

    $relationship = Relationship::factory()->create([
        'created_by' => $creator->id,
        'type' => RelationshipType::Couple,
        'status' => RelationshipStatus::Active,
    ]);

    $relationship->members()->attach($creator->id, ['role' => RelationshipRole::Creator->value]);
    $relationship->members()->attach($partner->id, ['role' => RelationshipRole::Partner->value]);

    expect($relationship->creator->id)->toBe($creator->id)
        ->and($relationship->members)->toHaveCount(2)
        ->and($relationship->type)->toBe(RelationshipType::Couple)
        ->and($relationship->status)->toBe(RelationshipStatus::Active);
});

test('journal entry has owner, contributors, blocks, and media', function () {
    $owner = User::factory()->create();
    $entry = JournalEntry::factory()->create([
        'user_id' => $owner->id,
        'mood' => Mood::Happy,
    ]);

    $block = JournalBlock::factory()->create([
        'journal_entry_id' => $entry->id,
        'created_by' => $owner->id,
    ]);

    $media = MemoryMedia::factory()->create([
        'user_id' => $owner->id,
        'journal_entry_id' => $entry->id,
    ]);

    expect($entry->owner->id)->toBe($owner->id)
        ->and($entry->mood)->toBe(Mood::Happy)
        ->and($entry->blocks)->toHaveCount(1)
        ->and($entry->media)->toHaveCount(1);
});

test('memory share validity checks work correctly', function () {
    $owner = User::factory()->create();
    $target = User::factory()->create();
    $entry = JournalEntry::factory()->create(['user_id' => $owner->id]);

    $validShare = MemoryShare::factory()->create([
        'resource_type' => 'journal_entry',
        'resource_id' => $entry->id,
        'owner_id' => $owner->id,
        'target_user_id' => $target->id,
        'permission' => SharePermission::View,
        'starts_at' => now()->subDay(),
        'ends_at' => now()->addDay(),
        'revoked_at' => null,
    ]);

    $revokedShare = MemoryShare::factory()->create([
        'resource_type' => 'journal_entry',
        'resource_id' => $entry->id,
        'owner_id' => $owner->id,
        'target_user_id' => $target->id,
        'permission' => SharePermission::View,
        'revoked_at' => now()->subHour(),
    ]);

    expect($validShare->isValid())->toBeTrue()
        ->and($revokedShare->isValid())->toBeFalse();
});

test('event and reminder models work with relations', function () {
    $user = User::factory()->create();

    $event = Event::factory()->create(['user_id' => $user->id]);
    $reminder = Reminder::factory()->create([
        'user_id' => $user->id,
        'remindable_type' => Event::class,
        'remindable_id' => $event->id,
    ]);

    expect($event->owner->id)->toBe($user->id)
        ->and($reminder->owner->id)->toBe($user->id)
        ->and($reminder->remindable->id)->toBe($event->id);
});

test('timeline event records user and polymorphic relation', function () {
    $user = User::factory()->create();
    $entry = JournalEntry::factory()->create(['user_id' => $user->id]);

    $timeline = TimelineEvent::factory()->create([
        'user_id' => $user->id,
        'eventable_type' => JournalEntry::class,
        'eventable_id' => $entry->id,
    ]);

    expect($timeline->owner->id)->toBe($user->id)
        ->and($timeline->eventable->id)->toBe($entry->id);
});
