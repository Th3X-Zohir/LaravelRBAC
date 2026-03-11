<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Room>
 */
class RoomFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'room_number' => fake()->unique()->numerify('###'),
            'status' => 'available',
        ];
    }

    /**
     * Mark the room as occupied.
     */
    public function occupied(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'occupied',
        ]);
    }

    /**
     * Mark the room as under maintenance.
     */
    public function maintenance(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'maintenance',
        ]);
    }
}
