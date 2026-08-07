<?php

namespace Database\Factories;

use App\Enums\MediaType;
use App\Models\MemoryMedia;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MemoryMedia>
 */
class MemoryMediaFactory extends Factory
{
    protected $model = MemoryMedia::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => MediaType::Photo,
            'storage_provider' => 'google_drive',
            'provider_file_id' => fake()->uuid(),
            'original_filename' => fake()->word().'.jpg',
            'mime_type' => 'image/jpeg',
            'size_bytes' => fake()->numberBetween(100000, 5000000),
            'width' => 1920,
            'height' => 1080,
            'sort_order' => 0,
        ];
    }
}
