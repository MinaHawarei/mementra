<?php

use App\Jobs\ProcessDueRemindersJob;
use App\Models\Reminder;
use App\Models\User;
use App\Notifications\ReminderDueNotification;
use App\Services\ReminderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

test('reminder due sends notification to user', function () {
    Notification::fake();
    $user = User::factory()->create();
    $service = app(ReminderService::class);

    $reminder = $service->createReminder($user, [
        'title' => 'Anniversary Memory',
        'remind_at' => now()->subMinute()->toDateTimeString(),
    ]);

    $job = new ProcessDueRemindersJob;
    $job->handle($service);

    Notification::assertSentTo($user, ReminderDueNotification::class, function ($notification) use ($reminder) {
        return $notification->reminder->id === $reminder->id;
    });
});

test('user stores in-app notifications in database channel', function () {
    $user = User::factory()->create();
    $reminder = Reminder::factory()->create(['user_id' => $user->id]);

    $user->notify(new ReminderDueNotification($reminder));

    expect($user->notifications)->toHaveCount(1);
    expect($user->notifications->first()->data['title'])->toBe($reminder->title);
});
