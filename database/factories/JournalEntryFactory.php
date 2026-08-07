<?php

namespace Database\Factories;

use App\Enums\Mood;
use App\Models\JournalEntry;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JournalEntry>
 */
class JournalEntryFactory extends Factory
{
    protected $model = JournalEntry::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(),
            'entry_date' => fake()->date(),
            'timezone' => 'UTC',
            'location_name' => fake()->city(),
            'latitude' => fake()->latitude(),
            'longitude' => fake()->longitude(),
            'mood' => fake()->randomElement(Mood::cases()),
            'is_private' => false,
            'status' => 'published',
        ];
    }
}
