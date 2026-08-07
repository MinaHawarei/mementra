<?php

namespace Database\Factories;

use App\Enums\Recurrence;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    protected $model = Event::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'event_date' => fake()->date(),
            'timezone' => 'UTC',
            'recurrence' => Recurrence::None,
        ];
    }
}
