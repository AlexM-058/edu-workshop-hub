<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('registrations', function (Blueprint $table) {
            $table->boolean('attended')->nullable()->default(null)->change();
        });

        // Convert existing false values to null if they mean "unconfirmed"
        DB::statement('UPDATE registrations SET attended = NULL WHERE attended = false');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('UPDATE registrations SET attended = false WHERE attended IS NULL');
        
        Schema::table('registrations', function (Blueprint $table) {
            $table->boolean('attended')->nullable(false)->default(false)->change();
        });
    }
};
