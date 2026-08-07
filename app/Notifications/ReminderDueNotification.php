<?php

namespace App\Notifications;

use App\Models\Reminder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReminderDueNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Reminder $reminder) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Reminder: {$this->reminder->title}")
            ->greeting("Hello {$notifiable->name},")
            ->line("You have a scheduled memory reminder: {$this->reminder->title}")
            ->action('View Memory', url('/journal'))
            ->line('Thank you for preserving your memories with Mementra!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'reminder_due',
            'reminder_id' => $this->reminder->id,
            'title' => $this->reminder->title,
            'description' => $this->reminder->description,
            'remind_at' => $this->reminder->remind_at?->toIso8601String(),
        ];
    }
}
