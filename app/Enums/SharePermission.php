<?php

namespace App\Enums;

enum SharePermission: string
{
    case View = 'view';
    case Comment = 'comment';
    case Collaborate = 'collaborate';
}
