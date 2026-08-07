<?php

namespace App\Models;

use App\Enums\SharePermission;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class MemoryShare extends Model
{
    use HasFactory;

    protected $fillable = [
        'resource_type',
        'resource_id',
        'owner_id',
        'target_user_id',
        'relationship_id',
        'permission',
        'starts_at',
        'ends_at',
        'revoked_at',
    ];

    protected function casts(): array
    {
        return [
            'permission' => SharePermission::class,
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function resource(): MorphTo
    {
        return $this->morphTo();
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function targetUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }

    public function relationship(): BelongsTo
    {
        return $this->belongsTo(Relationship::class);
    }

    public function isValid(): bool
    {
        if ($this->revoked_at !== null && $this->revoked_at->isPast()) {
            return false;
        }

        $now = now();

        if ($this->starts_at !== null && $this->starts_at->isFuture()) {
            return false;
        }

        if ($this->ends_at !== null && $this->ends_at->isPast()) {
            return false;
        }

        return true;
    }
}
