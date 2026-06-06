<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Adds a UNIQUE constraint on certificates.registration_id to enforce the
     * intended 1-to-1 relationship at the database level.
     *
     * This is intentionally kept as a separate migration from the certificates
     * table creation so that the constraint can be dropped independently if
     * needed during debugging or data migration.
     */
    public function up(): void
    {
        Schema::table('certificates', function (Blueprint $table): void {
            $table->unique('registration_id');
        });
    }

    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table): void {
            $table->dropUnique(['registration_id']);
        });
    }
};
