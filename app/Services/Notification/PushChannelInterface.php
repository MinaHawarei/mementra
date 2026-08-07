<?php

namespace App\Services\Notification;

use App\Models\User;

interface PushChannelInterface
{
    public function sendPush(User $user, string $title, string $body, array $data = []): bool;
}
