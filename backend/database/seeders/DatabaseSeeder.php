<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Creates one representative user per role so every application layout
     * can be tested in the local dev environment without a real Google login.
     */
    public function run(): void
    {
        // Admin
        User::factory()->withRole('admin')->create([
            'first_name' => 'Admin',
            'last_name'  => 'User',
            'email'      => 'admin@edu-workshop.local',
        ]);

        // Referent
        User::factory()->withRole('referent')->create([
            'first_name' => 'Referent',
            'last_name'  => 'User',
            'email'      => 'referent@edu-workshop.local',
        ]);

        // Professor (default role — also produced by a plain User::factory())
        User::factory()->create([
            'first_name' => 'Professor',
            'last_name'  => 'User',
            'email'      => 'professor@edu-workshop.local',
        ]);
    }
}

