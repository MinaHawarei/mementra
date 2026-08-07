<?php

namespace App\Enums;

enum MediaType: string
{
    case Photo = 'photo';
    case Video = 'video';
    case Audio = 'audio';
    case Document = 'document';
}
