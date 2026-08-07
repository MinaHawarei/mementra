<?php

namespace Database\Factories;

use App\Enums\Recurrence;
use App\Models\Reminder;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Reminder>
 */
class ReminderFactory extends Factory
{
    protected $model = Reminder::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(3),
            'description' => fake()->sentence(),
            'remind_at' => fake()->dateTimeBetween('now', '+1 month'),
            'recurrence' => Recurrence::None,
            'is_active' => true,
        ];
    }
}
