<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $firstName = fake()->firstName();
        $lastName  = fake()->lastName();

        return [
            'clerk_id'   => 'user_' . fake()->unique()->lexify('??????????'),
            'first_name' => $firstName,
            'last_name'  => $lastName,
            'name'       => "{$firstName} {$lastName}",
            'email'      => fake()->unique()->safeEmail(),
            'role'       => 'attender',
        ];
    }

    /** Create a teacher (legacy helper name kept for older tests). */
    public function referent(): static
    {
        return $this->state(['role' => 'teacher']);
    }

    /** Create a platform admin. */
    public function admin(): static
    {
        return $this->state(['role' => 'admin']);
    }
}
