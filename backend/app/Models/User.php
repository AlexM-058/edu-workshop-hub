<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * Platform user authenticated exclusively via Clerk.
 *
 * Roles: 'professor' (attender / learner), 'referent' (teacher / organiser),
 * 'admin'.
 *
 * The `password` column exists in the stock Laravel `users` table but is never
 * populated by this application — authentication is handled entirely by Clerk.
 * It is excluded from $fillable and from casts to avoid accidental use.
 */
#[Fillable(['clerk_id', 'first_name', 'last_name', 'name', 'email', 'role'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Returns the user's full display name.
     * Falls back to first_name, then email if both name parts are empty.
     */
    public function fullName(): string
    {
        $full = trim("{$this->first_name} {$this->last_name}");

        return $full !== '' ? $full : ($this->name ?? $this->email);
    }
}
