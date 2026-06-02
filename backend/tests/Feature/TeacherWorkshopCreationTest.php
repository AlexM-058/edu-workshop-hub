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

    public function test_teacher_can_create_draft_workshop(): void
    {
        TeacherInvitation::create([
            'email' => 'teacher@example.com',
            'role' => 'teacher',
        ]);

        $response = $this->withToken($this->clerkToken([
            'sub' => 'user_teacher_draft',
            'email' => 'teacher@example.com',
            'name' => 'Tina Teacher',
        ]))->postJson('/api/teacher/workshops', $this->validPayload([
            'status' => 'draft',
        ]));

        $teacher = User::where('email', 'teacher@example.com')->firstOrFail();

        $response
            ->assertCreated()
            ->assertJsonPath('workshop.teacher_id', $teacher->id)
            ->assertJsonPath('workshop.title', 'Applied Digital Pedagogy')
            ->assertJsonPath('workshop.status', 'draft');

        $this->assertDatabaseHas('workshops', [
            'teacher_id' => $teacher->id,
            'title' => 'Applied Digital Pedagogy',
            'status' => 'draft',
        ]);
    }

    public function test_teacher_can_create_published_workshop(): void
    {
        TeacherInvitation::create([
            'email' => 'published.teacher@example.com',
            'role' => 'teacher',
        ]);

        $this->withToken($this->clerkToken([
            'sub' => 'user_teacher_published',
            'email' => 'published.teacher@example.com',
        ]))->postJson('/api/teacher/workshops', $this->validPayload([
            'status' => 'published',
        ]))
            ->assertCreated()
            ->assertJsonPath('workshop.status', 'published');

        $this->assertDatabaseHas('workshops', [
            'title' => 'Applied Digital Pedagogy',
            'status' => 'published',
        ]);
    }

    public function test_admin_can_create_workshop(): void
    {
        config(['services.clerk.admin_emails' => ['admin@example.com']]);

        $this->withToken($this->clerkToken([
            'sub' => 'user_admin_workshop',
            'email' => 'admin@example.com',
            'name' => 'Admin User',
        ]))->postJson('/api/teacher/workshops', $this->validPayload([
            'title' => 'Admin Created Workshop',
        ]))
            ->assertCreated()
            ->assertJsonPath('workshop.title', 'Admin Created Workshop')
            ->assertJsonPath('workshop.status', 'draft');

        $admin = User::where('email', 'admin@example.com')->firstOrFail();

        $this->assertDatabaseHas('workshops', [
            'teacher_id' => $admin->id,
            'title' => 'Admin Created Workshop',
        ]);
    }

    public function test_attender_cannot_create_workshop(): void
    {
        $this->withToken($this->clerkToken([
            'sub' => 'user_attender_workshop',
            'email' => 'attender@example.com',
        ]))->postJson('/api/teacher/workshops', $this->validPayload())
            ->assertForbidden();

        $this->assertDatabaseCount('workshops', 0);
    }

    public function test_invalid_payload_is_rejected(): void
    {
        TeacherInvitation::create([
            'email' => 'invalid.teacher@example.com',
            'role' => 'teacher',
        ]);

        $this->withToken($this->clerkToken([
            'sub' => 'user_teacher_invalid',
            'email' => 'invalid.teacher@example.com',
        ]))->postJson('/api/teacher/workshops', [
            'title' => '',
            'category' => '',
            'description' => '',
            'status' => 'archived',
            'capacity' => 0,
            'starts_at' => '2026-09-10',
            'ends_at' => '2026-09-01',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'title',
                'category',
                'description',
                'status',
                'capacity',
                'ends_at',
            ]);

        $this->assertDatabaseCount('workshops', 0);
    }

    public function test_created_workshop_belongs_to_synced_user(): void
    {
        TeacherInvitation::create([
            'email' => 'synced.teacher@example.com',
            'role' => 'teacher',
        ]);

        $this->withToken($this->clerkToken([
            'sub' => 'user_synced_teacher',
            'email' => 'synced.teacher@example.com',
            'name' => 'Synced Teacher',
        ]))->postJson('/api/teacher/workshops', $this->validPayload([
            'title' => 'Synced User Workshop',
        ]))->assertCreated();

        $teacher = User::where('clerk_id', 'user_synced_teacher')->firstOrFail();

        $this->assertDatabaseHas('workshops', [
            'teacher_id' => $teacher->id,
            'title' => 'Synced User Workshop',
        ]);
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'title' => 'Applied Digital Pedagogy',
            'category' => 'Data Science',
            'description' => 'A practical workshop for teachers adopting data-informed classroom methods.',
            'coordinator_name' => 'Tina Teacher',
            'coordinator_bio' => 'Teacher educator and curriculum designer.',
            'starts_at' => '2026-09-01',
            'ends_at' => '2026-09-10',
            'duration' => '12 hours',
            'capacity' => 24,
            'location' => 'Online',
            'status' => 'draft',
        ], $overrides);
    }

    private function clerkToken(array $claims): string
    {
        return 'test:'.base64_encode(json_encode(array_merge([
            'sub' => 'user_123',
            'email' => 'alex@example.com',
            'name' => 'Alex Teacher',
            'iss' => config('services.clerk.issuer'),
            'exp' => time() + 3600,
            'nbf' => time() - 60,
        ], $claims), JSON_THROW_ON_ERROR));
    }
}
