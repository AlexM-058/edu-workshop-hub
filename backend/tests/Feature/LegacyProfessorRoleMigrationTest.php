<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Guards the migration that corrects any legacy role values.
 *
 * The migration `2026_06_01_000001` converts old 'attender'/'teacher' values
 * (from a previous naming iteration) back to the canonical 'professor'/'referent'.
 * On a fresh install the migration is a no-op since the Clerk migration already
 * defaults to 'professor'.
 */
class LegacyProfessorRoleMigrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_legacy_attender_roles_are_corrected_to_professor(): void
    {
        DB::table('users')->insert([
            'name'       => 'Legacy Attender',
            'email'      => 'attender@example.com',
            'role'       => 'attender',
            'password'   => 'unused',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $migration = require database_path('migrations/2026_06_01_000001_convert_professor_roles_to_attender.php');
        $migration->up();

        $this->assertDatabaseHas('users', [
            'email' => 'attender@example.com',
            'role'  => 'professor',
        ]);
    }

    public function test_legacy_teacher_roles_are_corrected_to_referent(): void
    {
        DB::table('users')->insert([
            'name'       => 'Legacy Teacher',
            'email'      => 'teacher@example.com',
            'role'       => 'teacher',
            'password'   => 'unused',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $migration = require database_path('migrations/2026_06_01_000001_convert_professor_roles_to_attender.php');
        $migration->up();

        $this->assertDatabaseHas('users', [
            'email' => 'teacher@example.com',
            'role'  => 'referent',
        ]);
    }
}
