<?php

use App\Enums\Recurrence;
use App\Jobs\ProcessDueRemindersJob;
use App\Models\JournalEntry;
use App\Models\Reminder;
use App\Models\User;
use App\Services\ReminderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

test('user can create remember this reminder for a journal entry', function () {
    $user = User::factory()->create();
    $entry = JournalEntry::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->post("/journal/{$entry->id}/remember", [
        'remind_at' => '2027-08-01',
        'recurrence' => Recurrence::Yearly->value,
    ]);

    $response->assertRedirect("/journal/{$entry->id}");

    expect(Reminder::count())->toBe(1);
    $reminder = Reminder::first();
    expect($reminder->user_id)->toBe($user->id);
    expect($reminder->remindable_type)->toBe(JournalEntry::class);
    expect($reminder->remindable_id)->toBe($entry->id);
    expect($reminder->recurrence)->toBe(Recurrence::Yearly);
});

test('ProcessDueRemindersJob processes due reminders idempotently', function () {
    $user = User::factory()->create();
    $service = app(ReminderService::class);

    $dueReminder = $service->createReminder($user, [
        'title' => 'Test due reminder',
        'remind_at' => now()->subMinute()->toDateTimeString(),
        'recurrence' => Recurrence::None->value,
    ]);

    $job = new ProcessDueRemindersJob;
    $job->handle($service);

    $dueReminder->refresh();
    expect($dueReminder->is_active)->toBeFalse();
    expect($dueReminder->last_triggered_at)->not->toBeNull();
});

test('reminders process artisan command dispatches job', function () {
    Queue::fake();

    $this->artisan('reminders:process')
        ->assertSuccessful();

    Queue::assertPushed(ProcessDueRemindersJob::class);
});
