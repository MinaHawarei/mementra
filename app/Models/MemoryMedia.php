<?php

namespace App\Models;

use App\Enums\MediaType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class MemoryMedia extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'memory_media';

    protected $fillable = [
        'user_id',
        'journal_entry_id',
        'type',
        'storage_provider',
        'provider_file_id',
        'original_filename',
        'mime_type',
        'size_bytes',
        'width',
        'height',
        'metadata',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'type' => MediaType::class,
            'size_bytes' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
            'sort_order' => 'integer',
            'metadata' => 'array',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function journalEntry(): BelongsTo
    {
        return $this->belongsTo(JournalEntry::class);
    }
}
