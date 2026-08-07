<?php

namespace App\Enums;

enum BlockType: string
{
    case Text = 'text';
    case Image = 'image';
    case Quote = 'quote';
    case Location = 'location';
}
