<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Workshop;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkshopCatalogTest extends TestCase
{
    use RefreshDatabase;

    private function makeReferent(): User
    {
        return User::factory()->create(['role' => 'referent']);
    }

    private function makeWorkshop(User $referent, array $overrides = []): Workshop
    {
        return Workshop::factory()->create(array_merge([
            'referent_id'  => $referent->id,
            'is_active'    => true,
            'scheduled_at' => now()->addDays(7),
        ], $overrides));
    }

    // -------------------------------------------------------------------------
    // GET /api/workshops
    // -------------------------------------------------------------------------

    public function test_index_returns_active_workshops_paginated(): void
    {
        $referent = $this->makeReferent();
        $this->makeWorkshop($referent);
        $this->makeWorkshop($referent);
        $this->makeWorkshop($referent, ['is_active' => false]); // excluded

        $response = $this->getJson('/api/workshops');

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonStructure([
                'data' => [[
                    'id', 'title', 'description', 'location',
                    'max_slots', 'occupied_slots', 'available_slots',
                    'is_open', 'scheduled_at', 'is_active', 'referent',
                ]],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_index_respects_per_page_param(): void
    {
        $referent = $this->makeReferent();
        for ($i = 0; $i < 5; $i++) {
            $this->makeWorkshop($referent);
        }

        $response = $this->getJson('/api/workshops?per_page=2');

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.total', 5);
    }

    public function test_index_caps_per_page_at_50(): void
    {
        $referent = $this->makeReferent();

        $response = $this->getJson('/api/workshops?per_page=999');

        $response->assertOk()
            ->assertJsonPath('meta.per_page', 50);
    }

    public function test_index_clamps_per_page_zero_to_one(): void
    {
        $this->getJson('/api/workshops?per_page=0')
            ->assertOk()
            ->assertJsonPath('meta.per_page', 1);
    }

    public function test_index_clamps_per_page_negative_to_one(): void
    {
        $this->getJson('/api/workshops?per_page=-5')
            ->assertOk()
            ->assertJsonPath('meta.per_page', 1);
    }

    // -------------------------------------------------------------------------
    // GET /api/workshops/{workshop}
    // -------------------------------------------------------------------------

    public function test_show_returns_single_active_workshop(): void
    {
        $referent = $this->makeReferent();
        $workshop = $this->makeWorkshop($referent);

        $response = $this->getJson("/api/workshops/{$workshop->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $workshop->id)
            ->assertJsonPath('data.title.ro', $workshop->title_ro)
            ->assertJsonPath('data.title.de', $workshop->title_de)
            ->assertJsonPath('data.referent.id', $referent->id);
    }

    public function test_show_returns_404_for_inactive_workshop(): void
    {
        $referent = $this->makeReferent();
        $workshop = $this->makeWorkshop($referent, ['is_active' => false]);

        $this->getJson("/api/workshops/{$workshop->id}")->assertNotFound();
    }

    public function test_show_returns_404_for_unknown_id(): void
    {
        $this->getJson('/api/workshops/9999')->assertNotFound();
    }

    public function test_available_slots_calculated_correctly(): void
    {
        $referent = $this->makeReferent();
        $workshop = $this->makeWorkshop($referent, [
            'max_slots'      => 30,
            'occupied_slots' => 10,
        ]);

        $this->getJson("/api/workshops/{$workshop->id}")
            ->assertOk()
            ->assertJsonPath('data.available_slots', 20)
            ->assertJsonPath('data.is_open', true);
    }
}
