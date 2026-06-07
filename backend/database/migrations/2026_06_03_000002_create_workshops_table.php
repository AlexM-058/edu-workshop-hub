<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Creates the canonical `workshops` table.
 *
 * Replaces the old two-step approach (create + alter) that was left over from
 * an earlier prototype. The table is now created in a single migration with
 * the full bilingual schema used by the current application.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workshops', function (Blueprint $table): void {
            $table->id();

            // The referent (teacher) who owns this workshop
            $table->foreignId('referent_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            // Bilingual title and description
            $table->string('title_ro');
            $table->string('title_de');
            $table->text('description_ro')->nullable();
            $table->text('description_de')->nullable();

            $table->string('location')->nullable();

            // Capacity management — occupied_slots is updated on every enrolment change
            $table->unsignedInteger('max_slots')->default(0);
            $table->unsignedInteger('occupied_slots')->default(0);

            $table->timestamp('scheduled_at')->nullable();

            // Only active workshops appear in the public catalogue
            $table->boolean('is_active')->default(false);

            $table->timestamps();

            $table->index(['referent_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workshops');
    }
};
