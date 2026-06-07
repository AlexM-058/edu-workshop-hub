<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class WorkshopMigrationDriftTest extends TestCase
{
    private string $previousDefaultConnection;

    protected function setUp(): void
    {
        parent::setUp();

        $this->previousDefaultConnection = config('database.default');

        config()->set('database.connections.migration_drift_test', [
            'driver' => 'sqlite',
            'database' => ':memory:',
            'prefix' => '',
            'foreign_key_constraints' => true,
        ]);
        config()->set('database.default', 'migration_drift_test');

        DB::purge('migration_drift_test');
        DB::reconnect('migration_drift_test');
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('workshops');
        Schema::dropIfExists('categories');

        DB::purge('migration_drift_test');
        config()->set('database.default', $this->previousDefaultConnection);

        parent::tearDown();
    }

    public function test_workshop_extra_fields_migration_tolerates_existing_category_column(): void
    {
        Schema::create('workshops', function (Blueprint $table): void {
            $table->id();
            $table->string('category')->nullable();
        });

        $migration = require database_path('migrations/2026_06_06_192222_add_extra_fields_to_workshops_table.php');

        $migration->up();

        $this->assertTrue(Schema::hasColumn('workshops', 'category'));
        $this->assertTrue(Schema::hasColumn('workshops', 'coordinator_name'));
        $this->assertTrue(Schema::hasColumn('workshops', 'coordinator_bio'));
        $this->assertTrue(Schema::hasColumn('workshops', 'ends_at'));
        $this->assertTrue(Schema::hasColumn('workshops', 'duration'));
        $this->assertTrue(Schema::hasColumn('workshops', 'cost'));
    }

    public function test_workshop_category_id_migration_tolerates_missing_legacy_category_column(): void
    {
        Schema::create('categories', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('workshops', function (Blueprint $table): void {
            $table->id();
        });

        $migration = require database_path('migrations/2026_06_07_003737_add_category_id_to_workshops_table.php');

        $migration->up();

        $this->assertTrue(Schema::hasColumn('workshops', 'category_id'));
        $this->assertFalse(Schema::hasColumn('workshops', 'category'));
    }

    public function test_default_categories_migration_seeds_empty_production_table_once(): void
    {
        Schema::create('categories', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('icon')->nullable();
            $table->timestamps();
        });

        $migration = require database_path('migrations/2026_06_07_140000_seed_default_categories.php');

        $migration->up();
        $migration->up();

        $this->assertSame(4, DB::table('categories')->count());
        $this->assertSame(
            ['Pedagogie', 'Tehnologie', 'Psihologie', 'Management Școlar'],
            DB::table('categories')->orderBy('id')->pluck('name')->all(),
        );
    }
}
