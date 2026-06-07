<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['title', 'description', 'capacity', 'starts_at', 'status'] as $column) {
            if (Schema::hasColumn('workshops', $column)) {
                DB::statement(sprintf('ALTER TABLE workshops ALTER COLUMN "%s" DROP NOT NULL', $column));
            }
        }
    }

    public function down(): void
    {
        // Intentionally irreversible: production rows created by the canonical
        // bilingual schema may legitimately have null legacy columns.
    }
};
