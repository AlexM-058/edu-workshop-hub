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
    }

    public function down(): void
    {
        DB::table('users')
            ->where('role', 'attender')
            ->update(['role' => 'professor']);
    }
};
