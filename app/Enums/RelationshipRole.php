<?php

namespace App\Enums;

enum RelationshipRole: string
{
    case Creator = 'creator';
    case Partner = 'partner';
    case Member = 'member';
}
