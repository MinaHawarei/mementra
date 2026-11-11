<?php

namespace App\Models;

use App\Enums\StorageConnectionStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StorageConnection extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'provider',
        'provider_account_id',
        'provider_email',
        'access_token',
        'refresh_token',
        'token_expires_at',
        'root_folder_id',
        'saved_folder_id',
        'status',
        'connected_at',
        'last_verified_at',
    ];

    protected function casts(): array
    {
        return [
            'access_token' => 'encrypted',
            'refresh_token' => 'encrypted',
            'token_expires_at' => 'datetime',
            'connected_at' => 'datetime',
            'last_verified_at' => 'datetime',
            'status' => StorageConnectionStatus::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function memoryMedia(): HasMany
    {
        return $this->hasMany(MemoryMedia::class);
    }

    public function savedMedia(): HasMany
    {
        return $this->hasMany(SavedMedia::class);
    }

    public function isConnected(): bool
    {
        return $this->status === StorageConnectionStatus::Connected;
    }

    public function isTokenExpired(): bool
    {
        if (! $this->token_expires_at) {
            return false;
        }

        // Buffer of 60 seconds before actual expiration
        return $this->token_expires_at->subSeconds(60)->isPast();
    }

    public function disconnect(): void
    {
        $this->update([
            'access_token' => null,
            'refresh_token' => null,
            'status' => StorageConnectionStatus::Disconnected,
        ]);
    }
}
