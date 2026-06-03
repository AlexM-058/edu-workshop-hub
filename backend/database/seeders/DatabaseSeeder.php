<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seeds the development environment with one user per platform role.
     *
     * These records use predictable clerk_id values so they can be targeted
     * in local test scripts. Do not seed production with this class.
     */
    public function run(): void
    {
        // Platform administrator
        User::factory()->admin()->create([
            'clerk_id'   => 'user_dev_admin',
            'first_name' => 'Admin',
            'last_name'  => 'Dev',
            'name'       => 'Admin Dev',
            'email'      => 'admin@edu-workshop.dev',
        ]);

        // Referent — creates and manages workshops
        User::factory()->referent()->create([
            'clerk_id'   => 'user_dev_referent',
            'first_name' => 'Referent',
            'last_name'  => 'Dev',
            'name'       => 'Referent Dev',
            'email'      => 'referent@edu-workshop.dev',
        ]);

        // Professor — browses and enrols in workshops
        User::factory()->create([
            'clerk_id'   => 'user_dev_professor',
            'first_name' => 'Professor',
            'last_name'  => 'Dev',
            'name'       => 'Professor Dev',
            'email'      => 'professor@edu-workshop.dev',
        ]);
    }
}
