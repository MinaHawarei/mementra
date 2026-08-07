<?php

namespace App\Models;

use App\Enums\RelationshipStatus;
use App\Enums\RelationshipType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Relationship extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'type',
        'status',
        'created_by',
        'anniversary_date',
        'connected_at',
        'ended_at',
    ];

    protected function casts(): array
    {
        return [
            'type' => RelationshipType::class,
            'status' => RelationshipStatus::class,
            'anniversary_date' => 'date',
            'connected_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'relationship_user')
            ->withPivot(['role', 'joined_at', 'left_at'])
            ->withTimestamps();
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }
}
