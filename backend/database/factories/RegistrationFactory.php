<?php

namespace Database\Factories;

use App\Models\Registration;
use App\Models\User;
use App\Models\Workshop;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Registration>
 */
class RegistrationFactory extends Factory
{
    protected $model = Registration::class;

    public function definition(): array
    {
        return [
            'workshop_id' => Workshop::factory(),
            'user_id'     => User::factory(),
            'status'      => 'enrolled',
            'attended'    => false,
        ];
    }

    public function enrolled(): static
    {
        return $this->state(['status' => 'enrolled']);
    }

    public function waitlist(): static
    {
        return $this->state(['status' => 'waitlist']);
    }

    public function cancelled(): static
    {
        return $this->state(['status' => 'cancelled']);
    }

    public function attended(): static
    {
        return $this->state(['status' => 'enrolled', 'attended' => true]);
    }
}
