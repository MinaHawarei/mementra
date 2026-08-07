<?php

use App\Enums\Recurrence;
use App\Enums\RelationshipStatus;
use App\Enums\SharePermission;
use App\Enums\TimelineEventType;
use App\Models\JournalEntry;
use App\Models\User;
use App\Services\JournalEntryService;
use App\Services\MemoryShareService;
use App\Services\RelationshipService;
use App\Services\ReminderService;
use App\Services\TimelineService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('JournalEntryService creates, updates and deletes entry with blocks', function () {
    $service = app(JournalEntryService::class);
    $user = User::factory()->create();

    $entry = $service->createEntry($user, [
        'title' => 'Our First Trip',
        'entry_date' => '2026-08-01',
        'blocks' => [
            ['type' => 'text', 'content_json' => ['text' => 'It was amazing']],
        ],
    ]);

    expect($entry->title)->toBe('Our First Trip')
        ->and($entry->blocks)->toHaveCount(1);

    $updated = $service->updateEntry($entry, [
        'title' => 'Our First Trip to Paris',
    ]);

    expect($updated->title)->toBe('Our First Trip to Paris');

    $service->deleteEntry($entry);
    expect(JournalEntry::count())->toBe(0);
});

test('MemoryShareService shares and revokes access', function () {
    $service = new MemoryShareService;
    $owner = User::factory()->create();
    $target = User::factory()->create();
    $entry = JournalEntry::factory()->create(['user_id' => $owner->id]);

    $share = $service->shareWithUser($owner, $entry, $target, SharePermission::View);

    expect($share->isValid())->toBeTrue();

    $service->revokeShare($share);
    expect($share->fresh()->isValid())->toBeFalse();
});

test('RelationshipService handles connection lifecycle', function () {
    $service = new RelationshipService;
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $rel = $service->initiateConnection($user1, $user2);
    expect($rel->status)->toBe(RelationshipStatus::Pending);

    $service->acceptConnection($rel);
    expect($rel->fresh()->status)->toBe(RelationshipStatus::Active);

    $service->endRelationship($rel);
    expect($rel->fresh()->status)->toBe(RelationshipStatus::Ended);
});

test('ReminderService creates and triggers due reminders with recurrence', function () {
    $service = new ReminderService;
    $user = User::factory()->create();

    $reminder = $service->createReminder($user, [
        'title' => 'Anniversary',
        'remind_at' => now()->subMinute(),
        'recurrence' => Recurrence::Yearly,
    ]);

    $due = $service->getDueReminders();
    expect($due)->toHaveCount(1);

    $processed = $service->processTriggered($reminder);
    expect($processed->is_active)->toBeTrue()
        ->and($processed->remind_at->year)->toBe(now()->year + 1);
});

test('TimelineService records and queries timeline events', function () {
    $service = new TimelineService;
    $user = User::factory()->create();

    $service->recordEvent($user, TimelineEventType::JournalEntryCreated, 'Created Entry', now()->toDateString());

    $timeline = $service->getUserTimeline($user);
    expect($timeline)->toHaveCount(1)
        ->and($timeline->first()->title)->toBe('Created Entry');
});
