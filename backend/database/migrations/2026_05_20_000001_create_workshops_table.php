<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the `workshops` table.
     *
     * `occupied_slots` is a denormalized counter kept in sync by the
     * application layer (service/action class) whenever a registration
     * status changes. This avoids expensive COUNT() queries on the hot
     * catalog read path.
     *
     * Both `title_ro` / `title_de` and `description_ro` / `description_de`
     * support the platform's bilingual (Romanian / German) requirement.
     */
    public function up(): void
    {
        Schema::create('workshops', function (Blueprint $table) {
            $table->id();

            // The referent who owns this workshop
            $table->foreignId('referent_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            // Bilingual titles — both are required
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

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workshops');
    }
};
