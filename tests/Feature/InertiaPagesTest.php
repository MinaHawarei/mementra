<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('dashboard page renders for authenticated user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertSuccessful();
});

test('user can view and create journal entries via inertia web routes', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/journal');
    $response->assertSuccessful();

    $createResponse = $this->actingAs($user)->post('/journal', [
        'title' => 'My Web Journal Memory',
        'entry_date' => '2026-08-07',
        'blocks' => [
            ['type' => 'text', 'content_json' => ['text' => 'Web story text']],
        ],
    ]);

    $createResponse->assertRedirect();
    $this->assertDatabaseHas('journal_entries', ['title' => 'My Web Journal Memory']);
});

test('memories and timeline pages render', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/memories')->assertSuccessful();
    $this->actingAs($user)->get('/timeline')->assertSuccessful();
});

test('user can manage events and reminders via web routes', function () {
    $user = User::factory()->create();

    $eventResponse = $this->actingAs($user)->post('/events', [
        'title' => 'Birthday Party',
        'event_date' => '2026-09-01',
    ]);
    $eventResponse->assertRedirect('/events');
    $this->assertDatabaseHas('events', ['title' => 'Birthday Party']);

    $reminderResponse = $this->actingAs($user)->post('/reminders', [
        'title' => 'Buy Cake',
        'remind_at' => '2026-08-31 10:00:00',
    ]);
    $reminderResponse->assertRedirect('/reminders');
    $this->assertDatabaseHas('reminders', ['title' => 'Buy Cake']);
});

test('user can update locale and timezone in preferences', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->patch('/settings/preferences', [
        'locale' => 'ar',
        'timezone' => 'Africa/Cairo',
    ]);

    $response->assertRedirect();
    expect($user->fresh()->locale->value)->toBe('ar')
        ->and($user->fresh()->timezone)->toBe('Africa/Cairo');
});
