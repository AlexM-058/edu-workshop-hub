<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workshop_enrollments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('workshop_id')->constrained('workshops')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status');
            $table->unsignedInteger('waitlist_position')->nullable();
            $table->timestamps();

            $table->unique(['workshop_id', 'user_id']);
            $table->index(['workshop_id', 'status', 'waitlist_position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workshop_enrollments');
    }
};
