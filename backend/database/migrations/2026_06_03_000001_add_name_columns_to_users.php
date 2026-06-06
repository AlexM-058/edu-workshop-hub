<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Adds first_name and last_name to the users table.
     *
     * Clerk returns a single `name` string. These columns are populated
     * by SyncClerkUser::sync() which splits the Clerk name on the first space.
     * Both columns are nullable so that existing rows (and Clerk users whose
     * name has not yet been synced) do not cause NOT NULL violations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('first_name', 100)->nullable()->after('clerk_id');
            $table->string('last_name', 100)->nullable()->after('first_name');
        });

        // Backfill first_name / last_name from the existing `name` column
        // for any rows already in the database.
        DB::table('users')->orderBy('id')->each(function (object $user): void {
            $parts = explode(' ', trim((string) ($user->name ?? '')), 2);
            DB::table('users')->where('id', $user->id)->update([
                'first_name' => $parts[0] !== '' ? $parts[0] : null,
                'last_name'  => isset($parts[1]) && $parts[1] !== '' ? $parts[1] : null,
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['first_name', 'last_name']);
        });
    }
};
