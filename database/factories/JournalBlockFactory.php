<?php

namespace Database\Factories;

use App\Enums\BlockType;
use App\Models\JournalBlock;
use App\Models\JournalEntry;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JournalBlock>
 */
class JournalBlockFactory extends Factory
{
    protected $model = JournalBlock::class;

    public function definition(): array
    {
        return [
            'journal_entry_id' => JournalEntry::factory(),
            'type' => BlockType::Text,
            'position' => 0,
            'content_json' => ['text' => fake()->paragraph()],
            'created_by' => User::factory(),
        ];
    }
}
