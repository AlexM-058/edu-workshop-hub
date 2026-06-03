<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Originally this migration converted 'professor' → 'attender'.
 * The role naming decision was reversed: 'professor' and 'referent' are the
 * canonical role names across the entire codebase (DB, backend, frontend).
 *
 * This migration is now a no-op kept only to preserve migration history
 * on existing environments that may have run the previous version.
 * On a fresh install the migration chain from 2026_05_29 already uses
 * 'professor' as the default, so nothing needs converting.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Revert any previous attender→professor conversions that may have
        // been applied by an earlier version of this migration.
        DB::table('users')
            ->where('role', 'attender')
            ->update(['role' => 'professor']);

        DB::table('users')
            ->where('role', 'teacher')
            ->update(['role' => 'referent']);
    }

    public function down(): void
    {
        // Intentionally left empty — this migration only cleans up legacy data.
    }
};
