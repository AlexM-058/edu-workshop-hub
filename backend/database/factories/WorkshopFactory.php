<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Workshop;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Workshop>
 */
class WorkshopFactory extends Factory
{
    protected $model = Workshop::class;

    public function definition(): array
    {
        return [
            'referent_id'    => User::factory()->referent(),
            'title_ro'       => $this->faker->sentence(4),
            'title_de'       => $this->faker->sentence(4),
            'description_ro' => $this->faker->paragraph(),
            'description_de' => $this->faker->paragraph(),
            'location'       => $this->faker->city(),
            'max_slots'      => $this->faker->numberBetween(10, 100),
            'occupied_slots' => 0,
            'scheduled_at'   => $this->faker->dateTimeBetween('+1 week', '+3 months'),
            'is_active'      => true,
        ];
    }

    /** Workshop with no available seats. */
    public function full(): static
    {
        return $this->state(fn (array $attributes) => [
            'occupied_slots' => $attributes['max_slots'],
        ]);
    }

    /** Inactive / archived workshop. */
    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
