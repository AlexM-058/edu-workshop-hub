<?php

namespace Tests\Feature;

use App\Models\TeacherInvitation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClerkAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_auth_me_rejects_requests_without_a_token(): void
    {
        $this->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_auth_me_rejects_invalid_tokens(): void
    {
        $this->withToken('not-a-token')
            ->getJson('/api/auth/me')
            ->assertUnauthorized();
    }

    public function test_auth_me_rejects_expired_tokens(): void
    {
        $this->withToken($this->clerkToken(['exp' => time() - 10]))
            ->getJson('/api/auth/me')
            ->assertUnauthorized();
    }

    public function test_auth_me_syncs_a_new_clerk_user_as_professor_by_default(): void
    {
        $this->withToken($this->clerkToken([
            'sub' => 'user_professor',
            'email' => 'professor@example.com',
            'name' => 'Pat Professor',
        ]))
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.email', 'professor@example.com')
            ->assertJsonPath('user.role', 'professor');

        $this->assertDatabaseHas('users', [
            'clerk_id' => 'user_professor',
            'email' => 'professor@example.com',
            'role' => 'professor',
        ]);
    }

    public function test_auth_me_accepts_teacher_invitation_during_sync(): void
    {
        TeacherInvitation::create([
            'email' => 'teacher@example.com',
            'role' => 'teacher',
        ]);

        $this->withToken($this->clerkToken([
            'sub' => 'user_teacher',
            'email' => 'teacher@example.com',
            'name' => 'Tina Teacher',
        ]))
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.role', 'teacher');

        $this->assertNotNull(TeacherInvitation::first()->accepted_at);

        $this->withToken($this->clerkToken([
            'sub' => 'user_teacher',
            'email' => 'teacher@example.com',
            'name' => 'Tina Teacher',
        ]))
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.role', 'teacher');
    }

    public function test_professor_is_forbidden_from_teacher_and_admin_endpoints(): void
    {
        $token = $this->clerkToken([
            'sub' => 'user_professor',
            'email' => 'professor@example.com',
        ]);

        $this->withToken($token)->getJson('/api/teacher/status')->assertForbidden();
        $this->withToken($token)
            ->postJson('/api/admin/teacher-invitations', ['email' => 'teacher@example.com'])
            ->assertForbidden();
    }

    public function test_admin_can_create_teacher_invitations(): void
    {
        config(['services.clerk.admin_emails' => ['admin@example.com']]);

        $this->withToken($this->clerkToken([
            'sub' => 'user_admin',
            'email' => 'admin@example.com',
            'name' => 'Admin User',
        ]))
            ->postJson('/api/admin/teacher-invitations', ['email' => 'new.teacher@example.com'])
            ->assertCreated()
            ->assertJsonPath('invitation.email', 'new.teacher@example.com')
            ->assertJsonPath('invitation.role', 'teacher');

        $this->assertDatabaseHas('teacher_invitations', [
            'email' => 'new.teacher@example.com',
            'role' => 'teacher',
        ]);
    }

    private function clerkToken(array $claims): string
    {
        return 'test:'.base64_encode(json_encode(array_merge([
            'sub' => 'user_123',
            'email' => 'alex@example.com',
            'name' => 'Alex Teacher',
            'exp' => time() + 3600,
            'nbf' => time() - 60,
        ], $claims), JSON_THROW_ON_ERROR));
    }
}
