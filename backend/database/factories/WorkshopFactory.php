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
        $titleRo = $this->faker->sentence(4);
        $titleDe = $this->faker->sentence(4);
        $descriptionRo = $this->faker->paragraph();
        $descriptionDe = $this->faker->paragraph();
        $maxSlots = $this->faker->numberBetween(10, 100);
        $scheduledAt = $this->faker->dateTimeBetween('+1 week', '+3 months');

        return [
            'referent_id'    => User::factory()->referent(),
            'title'          => $titleRo,
            'title_ro'       => $titleRo,
            'title_de'       => $titleDe,
            'category'       => 'general',
            'description'    => $descriptionRo,
            'description_ro' => $descriptionRo,
            'description_de' => $descriptionDe,
            'location'       => $this->faker->city(),
            'max_slots'      => $maxSlots,
            'capacity'       => $maxSlots,
            'occupied_slots' => 0,
            'starts_at'      => $scheduledAt,
            'scheduled_at'   => $scheduledAt,
            'status'         => 'published',
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
        return $this->state([
            'is_active' => false,
            'status' => 'draft',
        ]);
    }
}
