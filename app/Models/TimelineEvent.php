<?php

namespace App\Models;

use App\Enums\TimelineEventType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class TimelineEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'relationship_id',
        'event_type',
        'event_date',
        'title',
        'description',
        'metadata',
        'eventable_type',
        'eventable_id',
    ];

    protected function casts(): array
    {
        return [
            'event_type' => TimelineEventType::class,
            'event_date' => 'date',
            'metadata' => 'array',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function relationship(): BelongsTo
    {
        return $this->belongsTo(Relationship::class);
    }

    public function eventable(): MorphTo
    {
        return $this->morphTo();
    }
}
