<?php

use App\Enums\TimelineEventType;
use App\Models\JournalEntry;
use App\Models\User;
use App\Services\TimelineService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('timeline page loads for authenticated user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/timeline');

    $response->assertOk();
});

test('timeline events are sorted chronologically descending', function () {
    $user = User::factory()->create();
    $service = app(TimelineService::class);

    $oldest = $service->recordEvent($user, TimelineEventType::JournalEntryCreated, 'Old entry', '2025-01-01');
    $middle = $service->recordEvent($user, TimelineEventType::EventCreated, 'Mid event', '2025-06-15');
    $newest = $service->recordEvent($user, TimelineEventType::JournalEntryCreated, 'New entry', '2026-03-20');

    $timeline = $service->getUserTimeline($user);

    expect($timeline->first()->id)->toBe($newest->id);
    expect($timeline->last()->id)->toBe($oldest->id);
});

test('timeline paginated query returns paginator', function () {
    $user = User::factory()->create();
    $service = app(TimelineService::class);

    for ($i = 0; $i < 25; $i++) {
        $service->recordEvent($user, TimelineEventType::JournalEntryCreated, "Entry $i", now()->subDays($i)->toDateString());
    }

    $paginator = $service->getUserTimelinePaginated($user, 10);

    expect($paginator->count())->toBe(10);
    expect($paginator->total())->toBe(25);
    expect($paginator->lastPage())->toBe(3);
});

test('timeline includes media preview for journal entries', function () {
    $user = User::factory()->create();
    $entry = JournalEntry::factory()->create(['user_id' => $user->id]);
    $service = app(TimelineService::class);

    $event = $service->recordEvent(
        $user,
        TimelineEventType::JournalEntryCreated,
        $entry->title,
        $entry->entry_date,
        null,
        null,
        $entry
    );

    $paginator = $service->getUserTimelinePaginated($user);

    $firstEvent = $paginator->first();
    expect($firstEvent->eventable_type)->toBe(JournalEntry::class);
    expect($firstEvent->eventable_id)->toBe($entry->id);
});

test('timeline page renders with inertia component', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/timeline');

    $response->assertInertia(fn ($page) => $page->component('timeline/index')
        ->has('events')
    );
});
