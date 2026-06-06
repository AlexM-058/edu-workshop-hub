<?php

namespace Tests\Feature;

use App\Models\Certificate;
use App\Models\Registration;
use App\Models\User;
use App\Models\Workshop;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttenderRegistrationsTest extends TestCase
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

    private function makeProfessor(): User
    {
        return User::factory()->create(['role' => 'professor']);
    }

    private function makeReferent(): User
    {
        return User::factory()->create(['role' => 'referent']);
    }

    private function makeWorkshop(User $referent): Workshop
    {
        return Workshop::factory()->create([
            'referent_id'  => $referent->id,
            'is_active'    => true,
            'scheduled_at' => now()->addDays(7),
        ]);
    }

    private function register(User $professor, Workshop $workshop, string $status = 'enrolled', bool $attended = false): Registration
    {
        return Registration::create([
            'workshop_id' => $workshop->id,
            'user_id'     => $professor->id,
            'status'      => $status,
            'attended'    => $attended,
        ]);
    }

    // -------------------------------------------------------------------------
    // GET /api/attender/registrations
    // -------------------------------------------------------------------------

    public function test_registrations_requires_authentication(): void
    {
        $this->getJson('/api/attender/registrations')->assertUnauthorized();
    }

    public function test_referent_cannot_access_attender_registrations(): void
    {
        $referent = $this->makeReferent();

        $this->withToken($this->tokenFor($referent))
            ->getJson('/api/attender/registrations')
            ->assertForbidden();
    }

    public function test_professor_sees_only_own_registrations(): void
    {
        $professor = $this->makeProfessor();
        $other     = $this->makeProfessor();
        $referent  = $this->makeReferent();
        $workshop  = $this->makeWorkshop($referent);

        $this->register($professor, $workshop, 'enrolled');
        $this->register($other, $workshop, 'enrolled'); // must NOT appear

        $response = $this->withToken($this->tokenFor($professor))
            ->getJson('/api/attender/registrations');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonStructure([
                'data' => [[
                    'id', 'status', 'attended', 'created_at',
                    'workshop' => ['id', 'title', 'location', 'scheduled_at', 'referent'],
                    'has_certificate', 'can_download_certificate',
                ]],
                'meta',
            ]);
    }

    public function test_professor_sees_all_statuses_by_default(): void
    {
        $professor = $this->makeProfessor();
        $referent  = $this->makeReferent();
        $w1        = $this->makeWorkshop($referent);
        $w2        = $this->makeWorkshop($referent);
        $w3        = $this->makeWorkshop($referent);

        $this->register($professor, $w1, 'enrolled');
        $this->register($professor, $w2, 'waitlist');
        $this->register($professor, $w3, 'cancelled');

        $this->withToken($this->tokenFor($professor))
            ->getJson('/api/attender/registrations')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_professor_can_filter_by_status(): void
    {
        $professor = $this->makeProfessor();
        $referent  = $this->makeReferent();
        $w1        = $this->makeWorkshop($referent);
        $w2        = $this->makeWorkshop($referent);

        $this->register($professor, $w1, 'enrolled');
        $this->register($professor, $w2, 'waitlist');

        $this->withToken($this->tokenFor($professor))
            ->getJson('/api/attender/registrations?status=enrolled')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'enrolled');
    }

    public function test_has_certificate_is_false_when_not_attended(): void
    {
        $professor = $this->makeProfessor();
        $referent  = $this->makeReferent();
        $workshop  = $this->makeWorkshop($referent);
        $reg       = $this->register($professor, $workshop, 'enrolled', false);

        $this->withToken($this->tokenFor($professor))
            ->getJson('/api/attender/registrations')
            ->assertOk()
            ->assertJsonPath('data.0.has_certificate', false)
            ->assertJsonPath('data.0.can_download_certificate', false);
    }

    public function test_has_certificate_is_true_when_attended_and_cert_exists(): void
    {
        $professor = $this->makeProfessor();
        $referent  = $this->makeReferent();
        $workshop  = $this->makeWorkshop($referent);
        $reg       = $this->register($professor, $workshop, 'enrolled', true);

        Certificate::create([
            'registration_id' => $reg->id,
            'file_path'       => 'certificates/test-cert.pdf',
        ]);

        $this->withToken($this->tokenFor($professor))
            ->getJson('/api/attender/registrations')
            ->assertOk()
            ->assertJsonPath('data.0.has_certificate', true)
            ->assertJsonPath('data.0.can_download_certificate', true);
    }

    // -------------------------------------------------------------------------
    // GET /api/attender/stats
    // -------------------------------------------------------------------------

    public function test_stats_requires_authentication(): void
    {
        $this->getJson('/api/attender/stats')->assertUnauthorized();
    }

    public function test_stats_referent_is_forbidden(): void
    {
        $referent = $this->makeReferent();

        $this->withToken($this->tokenFor($referent))
            ->getJson('/api/attender/stats')
            ->assertForbidden();
    }

    public function test_stats_returns_correct_aggregates(): void
    {
        $professor = $this->makeProfessor();
        $other     = $this->makeProfessor();
        $referent  = $this->makeReferent();

        $w1 = $this->makeWorkshop($referent);
        $w2 = $this->makeWorkshop($referent);
        $w3 = $this->makeWorkshop($referent);
        $w4 = $this->makeWorkshop($referent);

        $r1 = $this->register($professor, $w1, 'enrolled', true);
        $r2 = $this->register($professor, $w2, 'enrolled', false);
        $this->register($professor, $w3, 'waitlist');
        $this->register($other, $w4, 'enrolled'); // excluded

        Certificate::create(['registration_id' => $r1->id, 'file_path' => 'cert/1.pdf']);

        $this->withToken($this->tokenFor($professor))
            ->getJson('/api/attender/stats')
            ->assertOk()
            ->assertExactJson([
                'total_enrolled'     => 2, // w1 + w2
                'total_waitlist'     => 1, // w3
                'total_attended'     => 1, // w1
                'total_certificates' => 1, // w1 has cert
            ]);
    }

    public function test_stats_returns_zeros_for_new_professor(): void
    {
        $professor = $this->makeProfessor();

        $this->withToken($this->tokenFor($professor))
            ->getJson('/api/attender/stats')
            ->assertOk()
            ->assertExactJson([
                'total_enrolled'     => 0,
                'total_waitlist'     => 0,
                'total_attended'     => 0,
                'total_certificates' => 0,
            ]);
    }
}
