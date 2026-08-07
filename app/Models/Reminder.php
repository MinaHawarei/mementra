<?php

namespace App\Models;

use App\Enums\Recurrence;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reminder extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'remindable_type',
        'remindable_id',
        'relationship_id',
        'title',
        'description',
        'remind_at',
        'recurrence',
        'is_active',
        'last_triggered_at',
    ];

    protected function casts(): array
    {
        return [
            'remind_at' => 'datetime',
            'last_triggered_at' => 'datetime',
            'recurrence' => Recurrence::class,
            'is_active' => 'boolean',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function remindable(): MorphTo
    {
        return $this->morphTo();
    }

    public function relationship(): BelongsTo
    {
        return $this->belongsTo(Relationship::class);
    }
}
