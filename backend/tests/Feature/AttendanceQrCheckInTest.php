<?php

namespace Tests\Feature;

use App\Models\Certificate;
use App\Models\Registration;
use App\Models\User;
use App\Models\Workshop;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AttendanceQrCheckInTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.clerk.allow_test_tokens' => true]);
    }

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

    private function teacher(): User
    {
        return User::factory()->create(['role' => 'teacher']);
    }

    private function workshopFor(User $teacher): Workshop
    {
        return Workshop::factory()->create([
            'referent_id' => $teacher->id,
            'is_active' => true,
        ]);
    }

    private function generateQrToken(User $teacher, Workshop $workshop): string
    {
        return $this->withToken($this->tokenFor($teacher))
            ->postJson("/api/teacher/workshops/{$workshop->id}/attendance-qr")
            ->assertCreated()
            ->json('token');
    }

    public function test_teacher_can_generate_qr_token_for_own_workshop(): void
    {
        $teacher = $this->teacher();
        $workshop = $this->workshopFor($teacher);

        $response = $this->withToken($this->tokenFor($teacher))
            ->postJson("/api/teacher/workshops/{$workshop->id}/attendance-qr");

        $response->assertCreated()
            ->assertJsonStructure([
                'token',
                'check_in_url',
                'expires_at',
                'session_expires_at',
                'refresh_after_seconds',
            ])
            ->assertJsonPath('refresh_after_seconds', 5);

        $rawToken = $response->json('token');
        $tokenExpiresAt = now()->parse($response->json('expires_at'));
        $sessionExpiresAt = now()->parse($response->json('session_expires_at'));

        $this->assertGreaterThan(90, now()->diffInSeconds($tokenExpiresAt, false));
        $this->assertGreaterThan(250, now()->diffInSeconds($sessionExpiresAt, false));
        $this->assertIsString($rawToken);
        $this->assertStringContainsString('/attendance/check-in?token=', $response->json('check_in_url'));
        $this->assertDatabaseMissing('attendance_qr_tokens', ['token_hash' => $rawToken]);
        $this->assertDatabaseHas('attendance_qr_tokens', [
            'workshop_id' => $workshop->id,
            'created_by' => $teacher->id,
        ]);
    }

    public function test_teacher_cannot_generate_qr_token_for_another_teacher_workshop(): void
    {
        $teacher = $this->teacher();
        $otherTeacher = $this->teacher();
        $workshop = $this->workshopFor($otherTeacher);

        $this->withToken($this->tokenFor($teacher))
            ->postJson("/api/teacher/workshops/{$workshop->id}/attendance-qr")
            ->assertNotFound();
    }

    public function test_enrolled_attender_can_check_in_with_valid_token(): void
    {
        $teacher = $this->teacher();
        $workshop = $this->workshopFor($teacher);
        $attender = User::factory()->create(['role' => 'attender']);
        $registration = Registration::factory()->for($workshop)->for($attender)->enrolled()->create();
        $rawToken = $this->generateQrToken($teacher, $workshop);

        $this->withToken($this->tokenFor($attender))
            ->postJson('/api/attender/attendance/check-in', ['token' => $rawToken])
            ->assertOk()
            ->assertJsonPath('status', 'confirmed')
            ->assertJsonPath('message', 'Attendance confirmed.');

        $this->assertDatabaseHas('registrations', [
            'id' => $registration->id,
            'attended' => true,
        ]);
        $this->assertDatabaseHas('certificates', [
            'registration_id' => $registration->id,
        ]);
    }

    public function test_double_check_in_is_idempotent(): void
    {
        $teacher = $this->teacher();
        $workshop = $this->workshopFor($teacher);
        $attender = User::factory()->create(['role' => 'attender']);
        $registration = Registration::factory()->for($workshop)->for($attender)->attended()->create();
        Certificate::create([
            'registration_id' => $registration->id,
            'file_path' => 'certificates/registration-'.$registration->id.'.pdf',
        ]);
        $rawToken = $this->generateQrToken($teacher, $workshop);

        $this->withToken($this->tokenFor($attender))
            ->postJson('/api/attender/attendance/check-in', ['token' => $rawToken])
            ->assertOk()
            ->assertJsonPath('status', 'already_confirmed')
            ->assertJsonPath('message', 'Attendance was already confirmed.');

        $this->assertSame(1, Certificate::where('registration_id', $registration->id)->count());
    }

    public function test_expired_token_is_rejected(): void
    {
        $teacher = $this->teacher();
        $workshop = $this->workshopFor($teacher);
        $attender = User::factory()->create(['role' => 'attender']);
        Registration::factory()->for($workshop)->for($attender)->enrolled()->create();
        $rawToken = 'expired-token';

        DB::table('attendance_qr_tokens')->insert([
            'workshop_id' => $workshop->id,
            'token_hash' => hash('sha256', $rawToken),
            'expires_at' => now()->subSecond(),
            'session_expires_at' => now()->addMinutes(4),
            'created_by' => $teacher->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->withToken($this->tokenFor($attender))
            ->postJson('/api/attender/attendance/check-in', ['token' => $rawToken])
            ->assertStatus(422)
            ->assertJsonPath('message', 'QR attendance token has expired.');
    }

    public function test_waitlist_cancelled_and_not_registered_attenders_are_rejected(): void
    {
        $teacher = $this->teacher();
        $workshop = $this->workshopFor($teacher);
        $waitlisted = User::factory()->create(['role' => 'attender']);
        $cancelled = User::factory()->create(['role' => 'attender']);
        $notRegistered = User::factory()->create(['role' => 'attender']);
        Registration::factory()->for($workshop)->for($waitlisted)->waitlist()->create();
        Registration::factory()->for($workshop)->for($cancelled)->cancelled()->create();

        foreach ([
            [$waitlisted, 'Only enrolled attenders can check in for this workshop.'],
            [$cancelled, 'Cancelled registrations cannot check in for this workshop.'],
            [$notRegistered, 'You are not registered for this workshop.'],
        ] as [$attender, $message]) {
            $rawToken = $this->generateQrToken($teacher, $workshop);

            $this->withToken($this->tokenFor($attender))
                ->postJson('/api/attender/attendance/check-in', ['token' => $rawToken])
                ->assertStatus(403)
                ->assertJsonPath('message', $message);
        }
    }

    public function test_teacher_and_admin_cannot_check_in_as_attender(): void
    {
        $teacher = $this->teacher();
        $admin = User::factory()->admin()->create();
        $workshop = $this->workshopFor($teacher);
        $rawToken = $this->generateQrToken($teacher, $workshop);

        foreach ([$teacher, $admin] as $user) {
            $this->withToken($this->tokenFor($user))
                ->postJson('/api/attender/attendance/check-in', ['token' => $rawToken])
                ->assertForbidden();
        }
    }
}
