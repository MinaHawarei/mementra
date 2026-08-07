<?php

namespace App\Models;

use App\Enums\Mood;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class JournalEntry extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'entry_date',
        'timezone',
        'location_name',
        'latitude',
        'longitude',
        'mood',
        'is_private',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'entry_date' => 'date',
            'mood' => Mood::class,
            'is_private' => 'boolean',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function contributors(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'journal_entry_contributors')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function blocks(): HasMany
    {
        return $this->hasMany(JournalBlock::class)->orderBy('position');
    }

    public function media(): HasMany
    {
        return $this->hasMany(MemoryMedia::class)->orderBy('sort_order');
    }

    public function shares(): MorphMany
    {
        return $this->morphMany(MemoryShare::class, 'resource');
    }

    public function reminders(): MorphMany
    {
        return $this->morphMany(Reminder::class, 'remindable');
    }
}
