<?php

namespace App\Services\Auth;

use App\Models\TeacherInvitation;
use App\Models\User;
use App\Services\Clerk\ClerkUserClient;

class SyncClerkUser
{
    public function __construct(private readonly ClerkUserClient $clerkUserClient) {}

    public function sync(array $claims): User
    {
        $clerkId = (string) $claims['sub'];
        $profile = $this->clerkUserClient->profileFromClaims($claims);
        $email = strtolower($profile['email']);
        $role = $this->roleFor($email);

        $user = User::query()
            ->where('clerk_id', $clerkId)
            ->orWhere('email', $email)
            ->first() ?? new User();

        $user->fill([
            'clerk_id' => $clerkId,
            'name' => $profile['name'],
            'email' => $email,
            'role' => $role,
        ]);
        $user->save();

        $this->acceptTeacherInvitation($user);

        return $user;
    }

    private function roleFor(string $email): string
    {
        if (in_array($email, config('services.clerk.admin_emails', []), true)) {
            return 'admin';
        }

        $invitation = TeacherInvitation::query()
            ->where('email', $email)
            ->where(function ($query): void {
                $query
                    ->whereNotNull('accepted_at')
                    ->orWhere(function ($query): void {
                        $query
                            ->whereNull('accepted_at')
                            ->where(function ($query): void {
                                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
                            });
                    });
            })
            ->first();

        return $invitation ? $invitation->role : 'professor';
    }

    private function acceptTeacherInvitation(User $user): void
    {
        if (! in_array($user->role, ['teacher', 'admin'], true)) {
            return;
        }

        TeacherInvitation::query()
            ->where('email', $user->email)
            ->whereNull('accepted_at')
            ->update(['accepted_at' => now()]);
    }
}
