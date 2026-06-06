<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Guards the migration that corrects any legacy role values.
 *
 * The migration `2026_06_01_000001` converts old 'professor'/'referent' values
 * back to the canonical 'attender'/'teacher' roles used by the current Clerk
 * and dashboard flows.
 */
class LegacyProfessorRoleMigrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_legacy_professor_roles_are_corrected_to_attender(): void
    {
        DB::table('users')->insert([
            'name'       => 'Legacy Professor',
            'email'      => 'professor@example.com',
            'role'       => 'professor',
            'password'   => 'unused',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $migration = require database_path('migrations/2026_06_01_000001_convert_professor_roles_to_attender.php');
        $migration->up();

        $this->assertDatabaseHas('users', [
            'email' => 'professor@example.com',
            'role'  => 'attender',
        ]);
    }

    public function test_legacy_referent_roles_are_corrected_to_teacher(): void
    {
        DB::table('users')->insert([
            'name'       => 'Legacy Referent',
            'email'      => 'referent@example.com',
            'role'       => 'referent',
            'password'   => 'unused',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $migration = require database_path('migrations/2026_06_01_000001_convert_professor_roles_to_attender.php');
        $migration->up();

        $this->assertDatabaseHas('users', [
            'email' => 'referent@example.com',
            'role'  => 'teacher',
        ]);
    }
}
