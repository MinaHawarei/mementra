<?php

namespace App\Enums;

enum TimelineEventType: string
{
    case MemoryCreated = 'memory_created';
    case RelationshipStarted = 'relationship_started';
    case RelationshipEnded = 'relationship_ended';
    case JournalEntryCreated = 'journal_entry_created';
    case EventCreated = 'event_created';
    case Milestone = 'milestone';
}
