<?php

namespace App\Enums;

enum RelationshipStatus: string
{
    case Pending = 'pending';
    case Active = 'active';
    case Paused = 'paused';
    case Ended = 'ended';
    case Rejected = 'rejected';
    case Cancelled = 'cancelled';
}
