<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $emails = array_values(array_filter(array_map(
            static fn (string $email): string => strtolower(trim($email)),
            explode(',', (string) env('EDUCRAFT_ADMIN_EMAILS', ''))
        )));

        if ($emails === []) {
            return;
        }

        DB::table('users')
            ->whereIn(DB::raw('lower(email)'), $emails)
            ->update([
                'role' => 'admin',
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        // Intentionally irreversible: admin promotion is environment-driven
        // operational state and should not be downgraded automatically.
    }
};
