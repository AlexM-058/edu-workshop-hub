<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the `registrations` table, which tracks every professor's
     * relationship to a workshop.
     *
     * Possible `status` values:
     *   - 'enrolled'   — confirmed seat
     *   - 'waitlist'   — on the waiting list (first-come, first-served order
     *                    is preserved by `created_at`)
     *   - 'cancelled'  — withdrawn by the professor or freed by the referent
     *
     * `attended` is set to true by a referent after the workshop ends;
     * a certificate may only be generated when this is true.
     *
     * The unique constraint on (workshop_id, user_id) prevents duplicate
     * active registrations for the same professor/workshop pair.
     */
    public function up(): void
    {
        Schema::create('registrations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('workshop_id')
                  ->constrained('workshops')
                  ->cascadeOnDelete();

            // The professor who registered
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            // Possible values: 'enrolled', 'waitlist', 'cancelled'
            $table->string('status');

            // Set to true by a referent after confirming attendance
            $table->boolean('attended')->default(false);

            $table->timestamps();

            // A professor may only have one active registration per workshop
            $table->unique(['workshop_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registrations');
    }
};
