<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('teacher_invitations', function (Blueprint $table): void {
            $table->timestamp('notice_seen_at')->nullable()->after('accepted_at');
        });
    }

    public function down(): void
    {
        Schema::table('teacher_invitations', function (Blueprint $table): void {
            $table->dropColumn('notice_seen_at');
        });
    }
};
