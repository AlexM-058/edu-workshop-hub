<?php

namespace App\Services\Auth;

use App\Models\TeacherInvitation;
use App\Models\User;
use App\Services\Clerk\ClerkUserClient;

class SyncClerkUser
{
    public function __construct(private readonly ClerkUserClient $clerkUserClient) {}

    /**
     * @return array{user: User, teacher_invitation_accepted: bool, teacher_invitation_notice_pending: bool}
     */
    public function sync(array $claims): array
    {
        $clerkId = (string) $claims['sub'];
        $profile = $this->clerkUserClient->profileFromClaims($claims);
        $email   = strtolower($profile['email']);
        $role    = $this->roleFor($email);

        [$firstName, $lastName] = $this->splitName((string) ($profile['name'] ?? ''));

        $user = User::query()
            ->where('clerk_id', $clerkId)
            ->orWhere('email', $email)
            ->first() ?? new User();

        // Only update the role on the first sync (no clerk_id yet) to prevent
        // silently downgrading a user whose invitation has since expired.
        $isNewUser = $user->clerk_id === null;

        $user->fill([
            'clerk_id'   => $clerkId,
            'name'       => $profile['name'],
            'first_name' => $firstName,
            'last_name'  => $lastName,
            'email'      => $email,
            'role'       => $this->syncedRole($user, $role, $isNewUser),
        ]);
        $user->save();

        $teacherInvitationAccepted = $this->acceptTeacherInvitation($user);

        return [
            'user' => $user,
            'teacher_invitation_accepted' => $teacherInvitationAccepted,
            'teacher_invitation_notice_pending' => $this->hasPendingTeacherInvitationNotice($user),
        ];
    }

    /**
     * Determines the initial role for a new user.
     *
     * Roles: 'attender' (default), 'teacher', 'admin'.
     */
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

        return $invitation ? $invitation->role : 'attender';
    }

    private function syncedRole(User $user, string $resolvedRole, bool $isNewUser): string
    {
        if ($resolvedRole === 'admin') {
            return 'admin';
        }

        if ($isNewUser) {
            return $resolvedRole;
        }

        // Promote an existing attender to referent/teacher if they now have an invitation
        if (
            in_array($resolvedRole, ['referent', 'teacher'], true)
            && in_array($user->role, ['attender', 'professor'], true)
        ) {
            return $resolvedRole;
        }

        return $user->role;
    }

    /**
     * Marks any pending teacher invitation as accepted once the user first logs in.
     */
    private function acceptTeacherInvitation(User $user): bool
    {
        if (! in_array($user->role, ['referent', 'teacher'], true)) {
            return false;
        }

        return TeacherInvitation::query()
            ->where('email', $user->email)
            ->whereNull('accepted_at')
            ->update(['accepted_at' => now()]) > 0;
    }

    private function hasPendingTeacherInvitationNotice(User $user): bool
    {
        if (! in_array($user->role, ['referent', 'teacher'], true)) {
            return false;
        }

        return TeacherInvitation::query()
            ->where('email', $user->email)
            ->whereIn('role', ['referent', 'teacher'])
            ->whereNotNull('accepted_at')
            ->whereNull('notice_seen_at')
            ->exists();
    }

    /**
     * Splits a full name string on the first space.
     *
     * @return array{string|null, string|null}
     */
    private function splitName(string $name): array
    {
        $name = trim($name);

        if ($name === '') {
            return [null, null];
        }

        $parts = explode(' ', $name, 2);

        return [
            $parts[0] !== '' ? $parts[0] : null,
            isset($parts[1]) && $parts[1] !== '' ? $parts[1] : null,
        ];
    }
}
