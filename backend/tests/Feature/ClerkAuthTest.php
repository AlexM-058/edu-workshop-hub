<?php

namespace Tests\Feature;

use App\Models\TeacherInvitation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClerkAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.clerk.allow_test_tokens' => true]);
    }

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

    public function test_auth_me_syncs_a_new_clerk_user_as_attender_by_default(): void
    {
        $this->withToken($this->clerkToken([
            'sub'   => 'user_attender',
            'email' => 'attender@example.com',
            'name'  => 'Ana Attender',
        ]))
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.email', 'attender@example.com')
            ->assertJsonPath('user.role', 'attender')
            ->assertJsonPath('user.first_name', 'Ana')
            ->assertJsonPath('user.last_name', 'Attender');

        $this->assertDatabaseHas('users', [
            'clerk_id'   => 'user_attender',
            'email'      => 'attender@example.com',
            'first_name' => 'Ana',
            'last_name'  => 'Attender',
            'role'       => 'attender',
        ]);
    }

    public function test_auth_me_accepts_teacher_invitation_during_first_sync(): void
    {
        TeacherInvitation::create([
            'email' => 'teacher@example.com',
            'role'  => 'teacher',
        ]);

        $this->withToken($this->clerkToken([
            'sub'   => 'user_teacher',
            'email' => 'teacher@example.com',
            'name'  => 'Tina Teacher',
        ]))
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.role', 'teacher')
            ->assertJsonPath('notifications.teacher_invitation_accepted', true);

        $this->assertNotNull(TeacherInvitation::first()->accepted_at);

        // Re-login: role must remain 'teacher' even after invitation expires
        $this->withToken($this->clerkToken([
            'sub'   => 'user_teacher',
            'email' => 'teacher@example.com',
            'name'  => 'Tina Teacher',
        ]))
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.role', 'teacher')
            ->assertJsonPath('notifications.teacher_invitation_accepted', false);
    }

    public function test_attender_is_forbidden_from_teacher_and_admin_endpoints(): void
    {
        $token = $this->clerkToken([
            'sub'   => 'user_attender_forbidden',
            'email' => 'attender.forbidden@example.com',
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
            'sub'   => 'user_admin',
            'email' => 'admin@example.com',
            'name'  => 'Admin User',
        ]))
            ->postJson('/api/admin/teacher-invitations', ['email' => 'new.teacher@example.com'])
            ->assertCreated()
            ->assertJsonPath('status', 'created')
            ->assertJsonPath('invitation.email', 'new.teacher@example.com')
            ->assertJsonPath('invitation.role', 'teacher');

        $this->assertDatabaseHas('teacher_invitations', [
            'email' => 'new.teacher@example.com',
            'role'  => 'teacher',
        ]);
    }

    public function test_duplicate_teacher_invitation_preserves_accepted_state(): void
    {
        config(['services.clerk.admin_emails' => ['admin@example.com']]);

        $acceptedAt = now()->subDay()->startOfSecond();
        TeacherInvitation::create([
            'email' => 'existing.teacher@example.com',
            'role' => 'teacher',
            'accepted_at' => $acceptedAt,
        ]);

        $this->withToken($this->clerkToken([
            'sub' => 'user_admin',
            'email' => 'admin@example.com',
            'name' => 'Admin User',
        ]))
            ->postJson('/api/admin/teacher-invitations', ['email' => 'Existing.Teacher@example.com'])
            ->assertOk()
            ->assertJsonPath('status', 'existing')
            ->assertJsonPath('invitation.email', 'existing.teacher@example.com')
            ->assertJsonPath('invitation.role', 'teacher');

        $this->assertDatabaseCount('teacher_invitations', 1);
        $this->assertEquals($acceptedAt->toISOString(), TeacherInvitation::first()->accepted_at->toISOString());
    }

    private function clerkToken(array $claims): string
    {
        return 'test:' . base64_encode(json_encode(array_merge([
            'sub'   => 'user_123',
            'email' => 'alex@example.com',
            'name'  => 'Alex Test',
            'iss'   => config('services.clerk.issuer'),
            'exp'   => time() + 3600,
            'nbf'   => time() - 60,
        ], $claims), JSON_THROW_ON_ERROR));
    }
}
