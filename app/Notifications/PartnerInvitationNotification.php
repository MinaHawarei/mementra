<?php

namespace App\Notifications;

use App\Models\Relationship;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PartnerInvitationNotification extends Notification
{
    use Queueable;

    public function __construct(public Relationship $relationship, public User $sender) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Partner Connection Invitation from {$this->sender->name}")
            ->greeting("Hello {$notifiable->name},")
            ->line("{$this->sender->name} ({$this->sender->email}) has invited you to connect your Mementra accounts and share your memory journey.")
            ->action('View Invitation', url('/relationship'))
            ->line('Connecting your accounts allows you to collaborate on shared memories, milestones, and photo albums.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'partner_invitation',
            'relationship_id' => $this->relationship->id,
            'sender_id' => $this->sender->id,
            'sender_name' => $this->sender->name,
            'sender_email' => $this->sender->email,
        ];
    }
}
