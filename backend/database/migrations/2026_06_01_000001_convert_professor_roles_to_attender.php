<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->where('role', 'professor')
            ->update(['role' => 'attender']);

        DB::table('users')
            ->where('role', 'referent')
            ->update(['role' => 'teacher']);
    }

    public function down(): void
    {
        // Intentionally left empty — this migration only cleans up legacy data.
    }
};
