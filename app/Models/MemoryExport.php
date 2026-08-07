<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemoryExport extends Model
{
    use HasFactory;

    protected $table = 'memory_exports';

    protected $fillable = [
        'user_id',
        'title',
        'date_from',
        'date_to',
        'locale',
        'timezone',
        'format',
        'status',
        'file_path',
        'file_size_bytes',
        'expires_at',
        'error_message',
    ];

    protected function casts(): array
    {
        return [
            'date_from' => 'date',
            'date_to' => 'date',
            'expires_at' => 'datetime',
            'file_size_bytes' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
