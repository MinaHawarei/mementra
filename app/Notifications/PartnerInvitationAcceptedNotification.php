<?php

namespace App\Notifications;

use App\Models\Relationship;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PartnerInvitationAcceptedNotification extends Notification
{
    use Queueable;

    public function __construct(public Relationship $relationship, public User $partner) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("{$this->partner->name} accepted your partner invitation!")
            ->greeting("Hello {$notifiable->name},")
            ->line("{$this->partner->name} has accepted your invitation. Your accounts are now connected!")
            ->action('Open Our Story', url('/relationship'))
            ->line('You can now collaborate on shared memories, milestones, and photo albums together.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'partner_invitation_accepted',
            'relationship_id' => $this->relationship->id,
            'partner_id' => $this->partner->id,
            'partner_name' => $this->partner->name,
            'partner_email' => $this->partner->email,
        ];
    }
}
