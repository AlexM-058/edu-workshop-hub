<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the `certificates` table.
     *
     * One certificate record is created per registration after the referent
     * confirms attendance. The `file_path` stores the relative path within
     * the application's storage disk (e.g. "certificates/2026/cert-42.pdf").
     *
     * The 1-to-1 relationship with `registrations` is enforced at the database
     * level by a UNIQUE constraint on `registration_id`, added in migration
     * `2026_05_20_000005_add_unique_registration_id_to_certificates_table`.
     *
     * Cascading on the registration ensures that if a registration record is
     * removed, the associated certificate row is also cleaned up automatically.
     */
    public function up(): void
    {
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();

            $table->foreignId('registration_id')
                  ->constrained('registrations')
                  ->cascadeOnDelete();

            // Relative path to the generated PDF within the storage disk
            $table->string('file_path', 500);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};
