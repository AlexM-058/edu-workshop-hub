<?php

namespace Tests\Feature;

use App\Models\TeacherInvitation;
use App\Models\User;
use App\Models\Workshop;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttenderWorkshopEnrollmentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.clerk.allow_test_tokens' => true]);
    }

    public function test_attender_enrolls_in_published_workshop_when_capacity_available(): void
    {
        $workshop = $this->workshop(['capacity' => 2]);

        $this->withToken($this->clerkToken([
            'sub' => 'user_attender_open',
            'email' => 'open.attender@example.com',
        ]))->postJson("/api/workshops/{$workshop->id}/enroll")
            ->assertCreated()
            ->assertJsonPath('enrollment.status', 'enrolled')
            ->assertJsonPath('enrollment.waitlist_position', null);

        $attender = User::where('email', 'open.attender@example.com')->firstOrFail();

        $this->assertDatabaseHas('workshop_enrollments', [
            'workshop_id' => $workshop->id,
            'user_id' => $attender->id,
            'status' => 'enrolled',
            'waitlist_position' => null,
        ]);
    }

    public function test_attender_joins_waiting_list_when_workshop_is_full(): void
    {
        $workshop = $this->workshop(['capacity' => 1]);
        $this->withToken($this->clerkToken([
            'sub' => 'user_existing_enrolled',
            'email' => 'existing@example.com',
        ]))->postJson("/api/workshops/{$workshop->id}/enroll")
            ->assertCreated();

        $this->withToken($this->clerkToken([
            'sub' => 'user_attender_waiting',
            'email' => 'waiting.attender@example.com',
        ]))->postJson("/api/workshops/{$workshop->id}/enroll")
            ->assertCreated()
            ->assertJsonPath('enrollment.status', 'waiting')
            ->assertJsonPath('enrollment.waitlist_position', 1);
    }

    public function test_waiting_list_position_increments_in_first_come_order(): void
    {
        $workshop = $this->workshop(['capacity' => 1]);
        $this->withToken($this->clerkToken([
            'sub' => 'user_existing_enrolled',
            'email' => 'existing@example.com',
        ]))->postJson("/api/workshops/{$workshop->id}/enroll")
            ->assertCreated();

        $this->withToken($this->clerkToken([
            'sub' => 'user_waiting_first',
            'email' => 'first.waiting@example.com',
        ]))->postJson("/api/workshops/{$workshop->id}/enroll")
            ->assertCreated()
            ->assertJsonPath('enrollment.waitlist_position', 1);

        $this->withToken($this->clerkToken([
            'sub' => 'user_waiting_second',
            'email' => 'second.waiting@example.com',
        ]))->postJson("/api/workshops/{$workshop->id}/enroll")
            ->assertCreated()
            ->assertJsonPath('enrollment.waitlist_position', 2);
    }

    public function test_duplicate_enrollment_is_rejected(): void
    {
        $workshop = $this->workshop(['capacity' => 2]);
        $token = $this->clerkToken([
            'sub' => 'user_duplicate_attender',
            'email' => 'duplicate.attender@example.com',
        ]);

        $this->withToken($token)->postJson("/api/workshops/{$workshop->id}/enroll")
            ->assertCreated();

        $this->withToken($token)->postJson("/api/workshops/{$workshop->id}/enroll")
            ->assertStatus(409)
            ->assertJsonPath('message', 'You are already enrolled or waiting for this workshop.');

        $this->assertDatabaseCount('workshop_enrollments', 1);
    }

    public function test_attender_cannot_enroll_in_draft_workshop(): void
    {
        $workshop = $this->workshop(['status' => 'draft']);

        $this->withToken($this->clerkToken([
            'sub' => 'user_draft_attender',
            'email' => 'draft.attender@example.com',
        ]))->postJson("/api/workshops/{$workshop->id}/enroll")
            ->assertStatus(422)
            ->assertJsonPath('message', 'Enrollment is only available for published workshops.');

        $this->assertDatabaseCount('workshop_enrollments', 0);
    }

    public function test_teacher_and_admin_cannot_use_attender_enrollment_endpoint(): void
    {
        $workshop = $this->workshop();
        TeacherInvitation::create([
            'email' => 'teacher@example.com',
            'role' => 'teacher',
        ]);
        config(['services.clerk.admin_emails' => ['admin@example.com']]);

        $this->withToken($this->clerkToken([
            'sub' => 'user_teacher_enroll',
            'email' => 'teacher@example.com',
        ]))->postJson("/api/workshops/{$workshop->id}/enroll")
            ->assertForbidden();

        $this->withToken($this->clerkToken([
            'sub' => 'user_admin_enroll',
            'email' => 'admin@example.com',
        ]))->postJson("/api/workshops/{$workshop->id}/enroll")
            ->assertForbidden();

        $this->assertDatabaseCount('workshop_enrollments', 0);
    }

    private function workshop(array $overrides = []): Workshop
    {
        $teacher = User::factory()->create([
            'email' => 'teacher-'.uniqid().'@example.com',
            'role' => 'teacher',
        ]);

        return Workshop::create(array_merge([
            'teacher_id' => $teacher->id,
            'title' => 'Applied Digital Pedagogy',
            'category' => 'Data Science',
            'description' => 'A practical workshop for teachers adopting data-informed classroom methods.',
            'capacity' => 24,
            'status' => 'published',
        ], $overrides));
    }

    private function clerkToken(array $claims): string
    {
        return 'test:'.base64_encode(json_encode(array_merge([
            'sub' => 'user_123',
            'email' => 'alex@example.com',
            'name' => 'Alex Attender',
            'iss' => config('services.clerk.issuer'),
            'exp' => time() + 3600,
            'nbf' => time() - 60,
        ], $claims), JSON_THROW_ON_ERROR));
    }
}
