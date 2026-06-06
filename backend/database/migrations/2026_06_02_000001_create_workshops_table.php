<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workshops', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('teacher_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->string('category');
            $table->text('description');
            $table->string('coordinator_name')->nullable();
            $table->text('coordinator_bio')->nullable();
            $table->date('starts_at')->nullable();
            $table->date('ends_at')->nullable();
            $table->string('duration')->nullable();
            $table->unsignedInteger('capacity')->nullable();
            $table->string('location')->nullable();
            $table->string('status')->default('draft');
            $table->timestamps();

            $table->index(['teacher_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workshops');
    }
};
