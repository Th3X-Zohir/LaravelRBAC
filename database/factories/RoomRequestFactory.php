<?php

namespace Database\Factories;

use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RoomRequest>
 */
class RoomRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $date = fake()->dateTimeBetween('+1 day', '+30 days');
        $slot = fake()->randomElement(\App\Models\RoomRequest::availableSlots());

        return [
            'user_id' => User::factory(),
            'room_id' => Room::factory(),
            'date' => $date->format('Y-m-d'),
            'start_time' => $slot['start_time'],
            'end_time' => $slot['end_time'],
            'purpose' => fake()->sentence(),
            'status' => 'pending',
        ];
    }

    /**
     * Mark the request as approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
            'reviewed_at' => now(),
        ]);
    }

    /**
     * Mark the request as rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'reviewed_at' => now(),
        ]);
    }
}
