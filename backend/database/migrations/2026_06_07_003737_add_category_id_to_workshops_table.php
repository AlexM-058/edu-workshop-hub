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
        if (! Schema::hasColumn('workshops', 'category_id')) {
            Schema::table('workshops', function (Blueprint $table) {
                $table->foreignId('category_id')->nullable()->constrained('categories')->cascadeOnDelete();
            });
        }

        if (Schema::hasColumn('workshops', 'category')) {
            Schema::table('workshops', function (Blueprint $table) {
                $table->dropColumn('category');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('workshops', 'category_id')) {
            Schema::table('workshops', function (Blueprint $table) {
                $table->dropForeign(['category_id']);
                $table->dropColumn('category_id');
            });
        }

        if (! Schema::hasColumn('workshops', 'category')) {
            Schema::table('workshops', function (Blueprint $table) {
                $table->string('category')->nullable();
            });
        }
    }
};
