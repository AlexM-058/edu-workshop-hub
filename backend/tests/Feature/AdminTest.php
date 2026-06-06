<?php

namespace Tests\Feature;

use App\Models\Registration;
use App\Models\User;
use App\Models\Workshop;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.clerk.allow_test_tokens' => true]);
    }

    // -------------------------------------------------------------------------
    // Token helper
    // -------------------------------------------------------------------------

    private function tokenFor(User $user): string
    {
        return 'test:' . base64_encode(json_encode([
            'sub'   => $user->clerk_id,
            'email' => $user->email,
            'name'  => $user->name,
            'iss'   => config('services.clerk.issuer'),
            'exp'   => time() + 3600,
            'nbf'   => time() - 60,
        ], JSON_THROW_ON_ERROR));
    }

    private function makeAdmin(): User
    {
        return User::factory()->admin()->create();
    }

    private function makeProfessor(): User
    {
        return User::factory()->create(['role' => 'professor']);
    }

    private function makeReferent(): User
    {
        return User::factory()->create(['role' => 'referent']);
    }

    // -------------------------------------------------------------------------
    // GET /api/admin/users
    // -------------------------------------------------------------------------

    public function test_users_requires_authentication(): void
    {
        $this->getJson('/api/admin/users')->assertUnauthorized();
    }

    public function test_professor_cannot_access_admin_users(): void
    {
        $professor = $this->makeProfessor();

        $this->withToken($this->tokenFor($professor))
            ->getJson('/api/admin/users')
            ->assertForbidden();
    }

    public function test_referent_cannot_access_admin_users(): void
    {
        $referent = $this->makeReferent();

        $this->withToken($this->tokenFor($referent))
            ->getJson('/api/admin/users')
            ->assertForbidden();
    }

    public function test_admin_can_list_all_users(): void
    {
        $admin = $this->makeAdmin();
        $this->makeProfessor();
        $this->makeReferent();

        $response = $this->withToken($this->tokenFor($admin))
            ->getJson('/api/admin/users');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [[
                    'id', 'name', 'email', 'role', 'created_at',
                ]],
                'meta' => ['total', 'current_page', 'last_page', 'per_page'],
            ]);

        $this->assertEquals(3, $response->json('meta.total'));
    }

    public function test_admin_can_filter_users_by_role(): void
    {
        $admin = $this->makeAdmin();
        $this->makeProfessor();
        $this->makeProfessor();
        $this->makeReferent();

        $response = $this->withToken($this->tokenFor($admin))
            ->getJson('/api/admin/users?role=professor');

        $response->assertOk()
            ->assertJsonCount(2, 'data');

        foreach ($response->json('data') as $user) {
            $this->assertEquals('professor', $user['role']);
        }
    }

    public function test_admin_users_respects_per_page(): void
    {
        $admin = $this->makeAdmin();
        User::factory()->count(5)->create(['role' => 'professor']);

        $response = $this->withToken($this->tokenFor($admin))
            ->getJson('/api/admin/users?per_page=3');

        $response->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('meta.per_page', 3);
    }

    // -------------------------------------------------------------------------
    // GET /api/admin/stats
    // -------------------------------------------------------------------------

    public function test_stats_requires_authentication(): void
    {
        $this->getJson('/api/admin/stats')->assertUnauthorized();
    }

    public function test_professor_cannot_access_admin_stats(): void
    {
        $professor = $this->makeProfessor();

        $this->withToken($this->tokenFor($professor))
            ->getJson('/api/admin/stats')
            ->assertForbidden();
    }

    public function test_admin_stats_returns_correct_aggregates(): void
    {
        $admin    = $this->makeAdmin();
        $prof1    = $this->makeProfessor();
        $prof2    = $this->makeProfessor();
        $referent = $this->makeReferent();

        $ws1 = Workshop::factory()->create(['referent_id' => $referent->id, 'is_active' => true]);
        $ws2 = Workshop::factory()->create(['referent_id' => $referent->id, 'is_active' => false]);

        Registration::create(['workshop_id' => $ws1->id, 'user_id' => $prof1->id, 'status' => 'enrolled',  'attended' => true]);
        Registration::create(['workshop_id' => $ws2->id, 'user_id' => $prof2->id, 'status' => 'enrolled',  'attended' => false]);
        Registration::create(['workshop_id' => $ws1->id, 'user_id' => $prof2->id, 'status' => 'waitlist',  'attended' => false]);

        $response = $this->withToken($this->tokenFor($admin))
            ->getJson('/api/admin/stats');

        $response->assertOk()
            ->assertExactJson([
                'total_users'      => 4,  // admin + 2 professors + 1 referent
                'total_professors' => 2,
                'total_referents'  => 1,
                'total_workshops'  => 2,
                'active_workshops' => 1,
                'total_enrolled'   => 2,  // enrolled only (not waitlist)
                'total_attended'   => 1,
            ]);
    }

    public function test_admin_stats_returns_zeros_on_empty_db(): void
    {
        $admin = $this->makeAdmin();

        $this->withToken($this->tokenFor($admin))
            ->getJson('/api/admin/stats')
            ->assertOk()
            ->assertExactJson([
                'total_users'      => 1, // just the admin
                'total_professors' => 0,
                'total_referents'  => 0,
                'total_workshops'  => 0,
                'active_workshops' => 0,
                'total_enrolled'   => 0,
                'total_attended'   => 0,
            ]);
    }
}
