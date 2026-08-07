<?php

use App\Models\JournalEntry;
use App\Models\MemoryMedia;
use App\Models\User;
use App\Services\TimelineService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

test('gallery page eager loads journal entry relation without N+1 queries', function () {
    $user = User::factory()->create();
    $entry = JournalEntry::factory()->create(['user_id' => $user->id]);
    MemoryMedia::factory()->count(10)->create([
        'user_id' => $user->id,
        'journal_entry_id' => $entry->id,
    ]);

    DB::enableQueryLog();

    $response = $this->actingAs($user)->get('/memories');
    $response->assertOk();

    $queryCount = count(DB::getQueryLog());
    // Should be low query count (user lookup, session, paginated media with eager loaded journal relation)
    expect($queryCount)->toBeLessThan(10);
});

test('timeline service paginates events efficiently', function () {
    $user = User::factory()->create();
    $service = app(TimelineService::class);

    DB::enableQueryLog();
    $paginator = $service->getUserTimelinePaginated($user, 15);
    $queryCount = count(DB::getQueryLog());

    expect($paginator->perPage())->toBe(15);
    expect($queryCount)->toBeLessThan(5);
});
