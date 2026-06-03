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
            'role'       => $isNewUser ? $role : $user->role,
        ]);
        $user->save();

        if ($isNewUser) {
            $this->acceptReferentInvitation($user);
        }

        return $user;
    }

    /**
     * Determines the initial role for a new user.
     *
     * Roles: 'professor' (default), 'referent', 'admin'.
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

        return $invitation ? $invitation->role : 'professor';
    }

    /**
     * Marks any pending referent invitation as accepted once the user first logs in.
     */
    private function acceptReferentInvitation(User $user): void
    {
        if (! in_array($user->role, ['referent', 'admin'], true)) {
            return;
        }

        TeacherInvitation::query()
            ->where('email', $user->email)
            ->whereNull('accepted_at')
            ->update(['accepted_at' => now()]);
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
