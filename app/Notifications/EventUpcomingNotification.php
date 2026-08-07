<?php

namespace App\Notifications;

use App\Models\Event;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EventUpcomingNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Event $event) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Upcoming Event: {$this->event->title}")
            ->greeting("Hello {$notifiable->name},")
            ->line("An upcoming milestone is approaching: {$this->event->title}")
            ->line("Date: {$this->event->event_date?->toDateString()}")
            ->action('View Events', url('/events'))
            ->line('Celebrate your journey with Mementra!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'event_upcoming',
            'event_id' => $this->event->id,
            'title' => $this->event->title,
            'event_date' => $this->event->event_date?->toIso8601String(),
        ];
    }
}
