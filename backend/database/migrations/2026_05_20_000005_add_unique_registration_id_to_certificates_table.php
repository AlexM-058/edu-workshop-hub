<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Enforces the intended 1-to-1 relationship between `registrations` and
     * `certificates` at the database level.
     *
     * A UNIQUE constraint on `registration_id` is preferred over making it the
     * primary key so that:
     *   - The auto-increment `id` column remains available as a stable surrogate
     *     key for any future foreign-key references to `certificates`.
     *   - The constraint intent is self-documenting (unique ≠ primary).
     *
     * Without this constraint the application layer is the only guard against
     * duplicate certificate rows for the same registration, which is insufficient
     * for a platform that calls itself critical infrastructure.
     */
    public function up(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->unique('registration_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->dropUnique(['registration_id']);
        });
    }
};
