<?php

namespace Database\Factories;

use App\Enums\TimelineEventType;
use App\Models\TimelineEvent;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TimelineEvent>
 */
class TimelineEventFactory extends Factory
{
    protected $model = TimelineEvent::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'event_type' => TimelineEventType::JournalEntryCreated,
            'event_date' => fake()->date(),
            'title' => fake()->sentence(3),
            'description' => fake()->sentence(),
        ];
    }
}
