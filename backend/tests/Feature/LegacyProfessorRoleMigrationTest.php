<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class LegacyProfessorRoleMigrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_legacy_professor_roles_are_converted_to_attender(): void
    {
        DB::table('users')->insert([
            'name' => 'Legacy Professor',
            'email' => 'legacy@example.com',
            'role' => 'professor',
            'password' => 'unused',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $migration = require database_path('migrations/2026_06_01_000001_convert_professor_roles_to_attender.php');

        $migration->up();

        $this->assertDatabaseHas('users', [
            'email' => 'legacy@example.com',
            'role' => 'attender',
        ]);
    }
}
