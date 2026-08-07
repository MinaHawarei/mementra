<?php

namespace App\Models;

use App\Enums\BlockType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JournalBlock extends Model
{
    use HasFactory;

    protected $fillable = [
        'journal_entry_id',
        'type',
        'position',
        'content_json',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'type' => BlockType::class,
            'position' => 'integer',
            'content_json' => 'array',
        ];
    }

    public function journalEntry(): BelongsTo
    {
        return $this->belongsTo(JournalEntry::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
