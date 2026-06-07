<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('workshops', function (Blueprint $table) {
            $table->string('category')->nullable();
            $table->string('coordinator_name')->nullable();
            $table->text('coordinator_bio')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->string('duration')->nullable();
            $table->decimal('cost', 8, 2)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('workshops', function (Blueprint $table) {
            $table->dropColumn([
                'category',
                'coordinator_name',
                'coordinator_bio',
                'ends_at',
                'duration',
                'cost'
            ]);
        });
    }
};
