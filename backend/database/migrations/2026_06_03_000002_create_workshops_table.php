<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Creates the `workshops` table.
     *
     * `occupied_slots` is a denormalized counter kept in sync by the
     * application layer whenever a registration status changes. This avoids
     * expensive COUNT() queries on the hot catalog read path.
     *
     * Both `title_ro`/`title_de` and `description_ro`/`description_de`
     * support the platform's bilingual (Romanian / German) requirement.
     *
     * `referent_id` references the referent (teacher role) who owns
     * this workshop.
     */
    public function up(): void
    {
        Schema::create('workshops', function (Blueprint $table): void {
            $table->id();

            // The referent who created and manages this workshop
            $table->foreignId('referent_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            // Bilingual titles — both required
            $table->string('title_ro');
            $table->string('title_de');

            // Bilingual descriptions — optional at creation time
            $table->text('description_ro')->nullable();
            $table->text('description_de')->nullable();

            $table->string('location');

            // Capacity management
            $table->integer('max_slots');
            $table->integer('occupied_slots')->default(0);

            // When the workshop takes place (stored in UTC)
            $table->timestamp('scheduled_at');

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workshops');
    }
};
