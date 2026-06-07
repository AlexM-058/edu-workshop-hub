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
        $missingColumns = array_values(array_filter([
            'category',
            'coordinator_name',
            'coordinator_bio',
            'ends_at',
            'duration',
            'cost',
        ], fn (string $column): bool => ! Schema::hasColumn('workshops', $column)));

        if ($missingColumns === []) {
            return;
        }

        Schema::table('workshops', function (Blueprint $table) use ($missingColumns) {
            if (in_array('category', $missingColumns, true)) {
                $table->string('category')->nullable();
            }

            if (in_array('coordinator_name', $missingColumns, true)) {
                $table->string('coordinator_name')->nullable();
            }

            if (in_array('coordinator_bio', $missingColumns, true)) {
                $table->text('coordinator_bio')->nullable();
            }

            if (in_array('ends_at', $missingColumns, true)) {
                $table->timestamp('ends_at')->nullable();
            }

            if (in_array('duration', $missingColumns, true)) {
                $table->string('duration')->nullable();
            }

            if (in_array('cost', $missingColumns, true)) {
                $table->decimal('cost', 8, 2)->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $columns = array_values(array_filter([
            'category',
            'coordinator_name',
            'coordinator_bio',
            'ends_at',
            'duration',
            'cost',
        ], fn (string $column): bool => Schema::hasColumn('workshops', $column)));

        if ($columns === []) {
            return;
        }

        Schema::table('workshops', function (Blueprint $table) use ($columns) {
            $table->dropColumn($columns);
        });
    }
};
