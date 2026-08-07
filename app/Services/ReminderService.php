<?php

namespace App\Services;

use App\Enums\Recurrence;
use App\Models\Reminder;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ReminderService
{
    public function createReminder(User $user, array $data): Reminder
    {
        return Reminder::create([
            'user_id' => $user->id,
            'remindable_type' => $data['remindable_type'] ?? null,
            'remindable_id' => $data['remindable_id'] ?? null,
            'relationship_id' => $data['relationship_id'] ?? null,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'remind_at' => $data['remind_at'],
            'recurrence' => $data['recurrence'] ?? Recurrence::None,
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    public function getDueReminders(): Collection
    {
        return Reminder::where('is_active', true)
            ->where('remind_at', '<=', now())
            ->get();
    }

    public function processTriggered(Reminder $reminder): Reminder
    {
        return DB::transaction(function () use ($reminder) {
            $reminder->last_triggered_at = now();

            if ($reminder->recurrence === Recurrence::None) {
                $reminder->is_active = false;
            } else {
                $next = match ($reminder->recurrence) {
                    Recurrence::Daily => $reminder->remind_at->addDay(),
                    Recurrence::Weekly => $reminder->remind_at->addWeek(),
                    Recurrence::Monthly => $reminder->remind_at->addMonth(),
                    Recurrence::Yearly => $reminder->remind_at->addYear(),
                    default => $reminder->remind_at,
                };
                $reminder->remind_at = $next;
            }

            $reminder->save();

            return $reminder;
        });
    }
}
