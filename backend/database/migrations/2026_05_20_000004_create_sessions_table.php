<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the `sessions` table required by Laravel when SESSION_DRIVER=database.
     *
     * This table is separate from the `users` migration intentionally:
     * it is an infrastructure concern (HTTP session storage) unrelated to the
     * domain schema, and keeping it isolated makes both files easier to read.
     *
     * The `user_id` column is nullable because unauthenticated visitors also
     * receive a session (needed for the OAuth redirect state and CSRF token
     * during the Google login flow).
     *
     * Note: no foreign-key constraint is added on `user_id`. Laravel's session
     * driver writes the user_id as a plain integer; adding a FK would cause
     * cascade issues when an admin deletes a user who still has open sessions.
     * The application layer is responsible for invalidating sessions on user
     * deletion.
     */
    public function up(): void
    {
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
    }
};
