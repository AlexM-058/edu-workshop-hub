<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * Produces a professor-role user without a google_id (simulating a user
     * created directly by an admin). Set google_id explicitly in tests that
     * exercise the OAuth login path.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'google_id'  => null,
            'first_name' => fake()->firstName(),
            'last_name'  => fake()->lastName(),
            'email'      => fake()->unique()->safeEmail(),
            'role'       => 'professor',
        ];
    }

    /**
     * Return a factory state that overrides the role.
     *
     * Usage:
     *   User::factory()->withRole('admin')->create();
     *   User::factory()->withRole('referent')->create();
     */
    public function withRole(string $role): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => $role,
        ]);
    }
}

