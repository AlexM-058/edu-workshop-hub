<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('clerk_id')->nullable()->unique()->after('id');
            $table->string('role')->default('attender')->after('email');
            if (Schema::getConnection()->getDriverName() !== 'sqlite') {
                $table->string('password')->nullable()->change();
            }
        });

        Schema::create('teacher_invitations', function (Blueprint $table): void {
            $table->id();
            $table->string('email')->unique();
            $table->string('role')->default('teacher');
            $table->foreignId('invited_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_invitations');

        Schema::table('users', function (Blueprint $table): void {
            $table->dropUnique(['clerk_id']);
            $table->dropColumn(['clerk_id', 'role']);
            if (Schema::getConnection()->getDriverName() !== 'sqlite') {
                $table->string('password')->nullable(false)->change();
            }
        });
    }
};
