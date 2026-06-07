<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('categories')) {
            return;
        }

        $now = now();

        foreach ($this->defaultCategories() as $category) {
            $existingId = DB::table('categories')
                ->where('name', $category['name'])
                ->value('id');

            if ($existingId) {
                DB::table('categories')
                    ->where('id', $existingId)
                    ->update([
                        'icon' => $category['icon'],
                        'updated_at' => $now,
                    ]);

                continue;
            }

            DB::table('categories')->insert([
                'name' => $category['name'],
                'icon' => $category['icon'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        // Keep user-managed categories intact.
    }

    private function defaultCategories(): array
    {
        return [
            ['name' => 'Pedagogie', 'icon' => 'school'],
            ['name' => 'Tehnologie', 'icon' => 'computer'],
            ['name' => 'Psihologie', 'icon' => 'psychology'],
            ['name' => 'Management Școlar', 'icon' => 'corporate_fare'],
        ];
    }
};
