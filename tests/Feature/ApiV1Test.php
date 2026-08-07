<?php

use App\Models\JournalEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated user can fetch me endpoint', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->getJson('/api/v1/me');

    $response->assertSuccessful()
        ->assertJsonPath('data.email', $user->email);
});

test('authenticated user can list and create journal entries', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->postJson('/api/v1/journal', [
        'title' => 'My Secret Journal Entry',
        'entry_date' => '2026-08-07',
        'blocks' => [
            ['type' => 'text', 'content_json' => ['text' => 'Hello World']],
        ],
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.title', 'My Secret Journal Entry');

    $listResponse = $this->getJson('/api/v1/journal');
    $listResponse->assertSuccessful()
        ->assertJsonCount(1, 'data');
});

test('user cannot view another users private journal entry via API', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $entry = JournalEntry::factory()->create(['user_id' => $owner->id, 'is_private' => true]);

    $this->actingAs($other);

    $response = $this->getJson("/api/v1/journal/{$entry->id}");
    $response->assertForbidden();
});

test('user can initiate and accept relationship via API', function () {
    $creator = User::factory()->create();
    $partner = User::factory()->create();

    $this->actingAs($creator);

    $response = $this->postJson('/api/v1/relationships', [
        'partner_email' => $partner->email,
        'type' => 'couple',
        'name' => 'Our Relationship',
    ]);

    $response->assertCreated();
    $relationshipId = $response->json('data.id');

    $this->actingAs($partner);
    $acceptResponse = $this->postJson("/api/v1/relationships/{$relationshipId}/accept");
    $acceptResponse->assertSuccessful()
        ->assertJsonPath('data.status', 'active');
});

test('user can create and list events and reminders via API', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $eventResponse = $this->postJson('/api/v1/events', [
        'title' => 'Anniversary Dinner',
        'event_date' => '2026-08-10',
    ]);
    $eventResponse->assertCreated();

    $reminderResponse = $this->postJson('/api/v1/reminders', [
        'title' => 'Buy Flowers',
        'remind_at' => now()->addDays(2)->toIso8601String(),
    ]);
    $reminderResponse->assertCreated();
});
