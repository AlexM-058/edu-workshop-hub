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

    public function test_auth_me_syncs_a_new_clerk_user_as_professor_by_default(): void
    {
        $this->withToken($this->clerkToken([
            'sub'   => 'user_professor',
            'email' => 'professor@example.com',
            'name'  => 'Ana Professor',
        ]))
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.email', 'professor@example.com')
            ->assertJsonPath('user.role', 'professor')
            ->assertJsonPath('user.first_name', 'Ana')
            ->assertJsonPath('user.last_name', 'Professor');

        $this->assertDatabaseHas('users', [
            'clerk_id'   => 'user_professor',
            'email'      => 'professor@example.com',
            'first_name' => 'Ana',
            'last_name'  => 'Professor',
            'role'       => 'professor',
        ]);
    }

    public function test_auth_me_accepts_referent_invitation_during_first_sync(): void
    {
        TeacherInvitation::create([
            'email' => 'referent@example.com',
            'role'  => 'referent',
        ]);

        $this->withToken($this->clerkToken([
            'sub'   => 'user_referent',
            'email' => 'referent@example.com',
            'name'  => 'Tina Referent',
        ]))
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.role', 'referent');

        $this->assertNotNull(TeacherInvitation::first()->accepted_at);

        // Re-login: role must remain 'referent' even after invitation expires
        $this->withToken($this->clerkToken([
            'sub'   => 'user_referent',
            'email' => 'referent@example.com',
            'name'  => 'Tina Referent',
        ]))
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.role', 'referent');
    }

    public function test_professor_is_forbidden_from_referent_and_admin_endpoints(): void
    {
        $token = $this->clerkToken([
            'sub'   => 'user_professor',
            'email' => 'professor@example.com',
        ]);

        $this->withToken($token)->getJson('/api/teacher/status')->assertForbidden();
        $this->withToken($token)
            ->postJson('/api/admin/teacher-invitations', ['email' => 'referent@example.com'])
            ->assertForbidden();
    }

    public function test_admin_can_create_referent_invitations(): void
    {
        config(['services.clerk.admin_emails' => ['admin@example.com']]);

        $this->withToken($this->clerkToken([
            'sub'   => 'user_admin',
            'email' => 'admin@example.com',
            'name'  => 'Admin User',
        ]))
            ->postJson('/api/admin/teacher-invitations', ['email' => 'new.referent@example.com'])
            ->assertCreated()
            ->assertJsonPath('invitation.email', 'new.referent@example.com')
            ->assertJsonPath('invitation.role', 'referent');

        $this->assertDatabaseHas('teacher_invitations', [
            'email' => 'new.referent@example.com',
            'role'  => 'referent',
        ]);
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
