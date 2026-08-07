<?php

namespace Database\Factories;

use App\Enums\SharePermission;
use App\Models\JournalEntry;
use App\Models\MemoryShare;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MemoryShare>
 */
class MemoryShareFactory extends Factory
{
    protected $model = MemoryShare::class;

    public function definition(): array
    {
        return [
            'resource_type' => 'journal_entry',
            'resource_id' => JournalEntry::factory(),
            'owner_id' => User::factory(),
            'target_user_id' => User::factory(),
            'permission' => SharePermission::View,
            'starts_at' => now(),
        ];
    }
}
