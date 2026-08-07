<?php

namespace App\Jobs;

use App\Notifications\ReminderDueNotification;
use App\Services\ReminderService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ProcessDueRemindersJob implements ShouldQueue
{
    use Queueable;

    public function handle(ReminderService $service): void
    {
        $dueReminders = $service->getDueReminders();

        Log::info("Processing {$dueReminders->count()} due reminders");

        foreach ($dueReminders as $reminder) {
            // Ensure idempotency: skip if already triggered in the current minute
            if ($reminder->last_triggered_at && $reminder->last_triggered_at->diffInSeconds(now()) < 60) {
                continue;
            }

            $service->processTriggered($reminder);

            if ($reminder->owner) {
                $reminder->owner->notify(new ReminderDueNotification($reminder));
            }
        }
    }
}
