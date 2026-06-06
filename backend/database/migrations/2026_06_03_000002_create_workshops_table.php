<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('workshops', function (Blueprint $table): void {
            $table->foreignId('referent_id')
                ->nullable()
                ->after('teacher_id')
                ->constrained('users')
                ->nullOnDelete();
            $table->string('title_ro')->nullable()->after('title');
            $table->string('title_de')->nullable()->after('title_ro');
            $table->text('description_ro')->nullable()->after('description');
            $table->text('description_de')->nullable()->after('description_ro');
            $table->integer('max_slots')->nullable()->after('capacity');
            $table->integer('occupied_slots')->default(0)->after('max_slots');
            $table->timestamp('scheduled_at')->nullable()->after('status');
            $table->boolean('is_active')->default(false)->after('scheduled_at');

            $table->index(['referent_id', 'is_active']);
        });

        DB::table('workshops')
            ->where('status', 'published')
            ->update(['is_active' => true]);
    }

    public function down(): void
    {
        Schema::table('workshops', function (Blueprint $table): void {
            $table->dropIndex(['referent_id', 'is_active']);
            $table->dropConstrainedForeignId('referent_id');
            $table->dropColumn([
                'title_ro',
                'title_de',
                'description_ro',
                'description_de',
                'max_slots',
                'occupied_slots',
                'scheduled_at',
                'is_active',
            ]);
        });
    }
};
