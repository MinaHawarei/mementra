<?php

namespace Database\Factories;

use App\Enums\RelationshipStatus;
use App\Enums\RelationshipType;
use App\Models\Relationship;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Relationship>
 */
class RelationshipFactory extends Factory
{
    protected $model = Relationship::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'type' => RelationshipType::Couple,
            'status' => RelationshipStatus::Active,
            'created_by' => User::factory(),
            'anniversary_date' => fake()->date(),
            'connected_at' => now(),
        ];
    }
}
