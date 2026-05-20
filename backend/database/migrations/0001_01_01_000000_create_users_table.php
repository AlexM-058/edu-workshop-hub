<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the `users` table for all platform roles (admin, referent, professor).
     * Authentication is handled exclusively via Google OAuth, so no password column
     * is included. The `google_id` column is nullable to allow future non-OAuth
     * user creation by admins if needed.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // Google OAuth identifier — nullable for admin-created accounts
            $table->string('google_id')->nullable()->unique();

            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('email')->unique();

            // Possible values: 'admin', 'referent', 'professor'
            $table->string('role')->default('professor');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
