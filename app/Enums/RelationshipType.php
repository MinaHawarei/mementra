<?php

namespace App\Enums;

enum RelationshipType: string
{
    case Couple = 'couple';
    case Family = 'family';
    case Friendship = 'friendship';
    case Custom = 'custom';
}
