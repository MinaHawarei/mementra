<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavedMedia extends Model
{
    use HasFactory;

    protected $table = 'saved_media';

    protected $fillable = [
        'user_id',
        'original_media_id',
        'original_owner_id',
        'storage_connection_id',
        'provider',
        'provider_file_id',
        'original_filename',
        'mime_type',
        'size_bytes',
        'metadata',
        'saved_at',
    ];

    protected function casts(): array
    {
        return [
            'size_bytes' => 'integer',
            'metadata' => 'array',
            'saved_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function originalMedia(): BelongsTo
    {
        return $this->belongsTo(MemoryMedia::class, 'original_media_id');
    }

    public function originalOwner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'original_owner_id');
    }

    public function storageConnection(): BelongsTo
    {
        return $this->belongsTo(StorageConnection::class);
    }
}
