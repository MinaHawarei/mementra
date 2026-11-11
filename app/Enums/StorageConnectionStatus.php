<?php

namespace App\Enums;

enum StorageConnectionStatus: string
{
    case Connected = 'connected';
    case Disconnected = 'disconnected';
    case Expired = 'expired';
    case ReauthorizationRequired = 'reauthorization_required';
    case Error = 'error';
}
