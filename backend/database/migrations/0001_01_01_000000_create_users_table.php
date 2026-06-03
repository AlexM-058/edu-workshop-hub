<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Creates the base `users` table.
     *
     * Authentication is handled exclusively via Clerk (JWT bearer tokens).
     * The `password` and `remember_token` columns are kept because they exist
     * in Laravel's stock migration and some framework internals reference them,
     * but they are never populated by this application.
     *
     * `name`, `email`, `first_name`, `last_name` are populated by SyncClerkUser
     * on every first login.
     *
     * `clerk_id`, `role` are added by the next migration
     * (2026_05_29_103444_add_clerk_auth_to_users_and_teacher_invitations).
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
