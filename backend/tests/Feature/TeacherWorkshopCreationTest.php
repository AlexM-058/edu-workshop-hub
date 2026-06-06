<?php

namespace Tests\Feature;

use App\Models\TeacherInvitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherWorkshopCreationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.clerk.allow_test_tokens' => true]);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function clerkToken(array $claims): string
    {
        return 'test:' . base64_encode(json_encode(array_merge([
            'sub'   => 'user_123',
            'email' => 'alex@example.com',
            'name'  => 'Alex Teacher',
            'iss'   => config('services.clerk.issuer'),
            'exp'   => time() + 3600,
            'nbf'   => time() - 60,
        ], $claims), JSON_THROW_ON_ERROR));
    }

    /**
     * A valid payload using the current bilingual schema fields.
     * Also includes legacy aliases (title, capacity, starts_at, status)
     * that the form still sends — the controller must accept both.
     */
    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'title'        => 'Applied Digital Pedagogy',      // legacy alias → title_ro / title_de
            'description'  => 'A practical workshop for teachers adopting data-informed classroom methods.',
            'capacity'     => 24,                              // legacy alias → max_slots
            'starts_at'    => '2026-09-01',                    // legacy alias → scheduled_at
            'location'     => 'Online',
            'status'       => 'draft',                         // legacy alias → is_active
        ], $overrides);
    }

    private function inviteTeacher(string $email): void
    {
        TeacherInvitation::create(['email' => $email, 'role' => 'teacher']);
    }

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    public function test_teacher_can_create_draft_workshop(): void
    {
        $this->inviteTeacher('teacher@example.com');

        $response = $this->withToken($this->clerkToken([
            'sub'   => 'user_teacher_draft',
            'email' => 'teacher@example.com',
            'name'  => 'Tina Teacher',
        ]))->postJson('/api/teacher/workshops', $this->validPayload(['status' => 'draft']));

        $teacher = User::where('email', 'teacher@example.com')->firstOrFail();

        $response
            ->assertCreated()
            ->assertJsonPath('workshop.referent.id', $teacher->id)
            ->assertJsonPath('workshop.title.ro', 'Applied Digital Pedagogy')
            ->assertJsonPath('workshop.is_active', false);

        $this->assertDatabaseHas('workshops', [
            'referent_id' => $teacher->id,
            'title_ro'    => 'Applied Digital Pedagogy',
            'is_active'   => false,
        ]);
    }

    public function test_teacher_can_create_published_workshop(): void
    {
        $this->inviteTeacher('published.teacher@example.com');

        $this->withToken($this->clerkToken([
            'sub'   => 'user_teacher_published',
            'email' => 'published.teacher@example.com',
        ]))->postJson('/api/teacher/workshops', $this->validPayload(['status' => 'published']))
            ->assertCreated()
            ->assertJsonPath('workshop.is_active', true);

        $this->assertDatabaseHas('workshops', [
            'title_ro'  => 'Applied Digital Pedagogy',
            'is_active' => true,
        ]);
    }

    public function test_teacher_can_create_workshop_with_canonical_fields(): void
    {
        $this->inviteTeacher('bilingual.teacher@example.com');

        $this->withToken($this->clerkToken([
            'sub'   => 'user_teacher_bilingual',
            'email' => 'bilingual.teacher@example.com',
        ]))->postJson('/api/teacher/workshops', [
            'title_ro'       => 'Pedagogie Digitală',
            'title_de'       => 'Digitale Pädagogik',
            'description_ro' => 'Descriere în română',
            'description_de' => 'Beschreibung auf Deutsch',
            'max_slots'      => 30,
            'location'       => 'București',
            'scheduled_at'   => '2026-10-01',
            'is_active'      => true,
        ])
            ->assertCreated()
            ->assertJsonPath('workshop.title.ro', 'Pedagogie Digitală')
            ->assertJsonPath('workshop.title.de', 'Digitale Pädagogik')
            ->assertJsonPath('workshop.is_active', true);
    }

    public function test_admin_can_create_workshop(): void
    {
        config(['services.clerk.admin_emails' => ['admin@example.com']]);

        $this->withToken($this->clerkToken([
            'sub'   => 'user_admin_workshop',
            'email' => 'admin@example.com',
            'name'  => 'Admin User',
        ]))->postJson('/api/teacher/workshops', $this->validPayload([
            'title' => 'Admin Created Workshop',
        ]))
            ->assertCreated()
            ->assertJsonPath('workshop.title.ro', 'Admin Created Workshop')
            ->assertJsonPath('workshop.is_active', false);

        $admin = User::where('email', 'admin@example.com')->firstOrFail();

        $this->assertDatabaseHas('workshops', [
            'referent_id' => $admin->id,
            'title_ro'    => 'Admin Created Workshop',
        ]);
    }

    public function test_attender_cannot_create_workshop(): void
    {
        $this->withToken($this->clerkToken([
            'sub'   => 'user_attender_workshop',
            'email' => 'attender@example.com',
        ]))->postJson('/api/teacher/workshops', $this->validPayload())
            ->assertForbidden();

        $this->assertDatabaseCount('workshops', 0);
    }

    public function test_invalid_payload_is_rejected(): void
    {
        $this->inviteTeacher('invalid.teacher@example.com');

        $this->withToken($this->clerkToken([
            'sub'   => 'user_teacher_invalid',
            'email' => 'invalid.teacher@example.com',
        ]))->postJson('/api/teacher/workshops', [
            'title'     => 123,           // must be string
            'capacity'  => -5,            // must be >= 1
            'max_slots' => 0,             // must be >= 1
            'status'    => 'archived',    // not in [draft, published]
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'capacity', 'max_slots', 'status']);

        $this->assertDatabaseCount('workshops', 0);
    }

    public function test_created_workshop_belongs_to_synced_user(): void
    {
        $this->inviteTeacher('synced.teacher@example.com');

        $this->withToken($this->clerkToken([
            'sub'   => 'user_synced_teacher',
            'email' => 'synced.teacher@example.com',
            'name'  => 'Synced Teacher',
        ]))->postJson('/api/teacher/workshops', $this->validPayload([
            'title' => 'Synced User Workshop',
        ]))->assertCreated();

        $teacher = User::where('clerk_id', 'user_synced_teacher')->firstOrFail();

        $this->assertDatabaseHas('workshops', [
            'referent_id' => $teacher->id,
            'title_ro'    => 'Synced User Workshop',
        ]);
    }
}
