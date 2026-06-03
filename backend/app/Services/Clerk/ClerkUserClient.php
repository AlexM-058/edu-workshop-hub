<?php

namespace App\Services\Clerk;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class ClerkUserClient
{
    public function profileFromClaims(array $claims): array
    {
        $email = $claims['email'] ?? $claims['primary_email_address'] ?? null;
        $name = $claims['name'] ?? trim(($claims['given_name'] ?? '').' '.($claims['family_name'] ?? ''));

        if ($email) {
            return [
                'name' => $name !== '' ? $name : $email,
                'email' => strtolower($email),
            ];
        }

        return $this->profileFromApi((string) $claims['sub']);
    }

    private function profileFromApi(string $clerkId): array
    {
        $secretKey = config('services.clerk.secret_key');

        if (! $secretKey) {
            throw new RuntimeException('CLERK_SECRET_KEY is required when token claims do not contain email.');
        }

        $payload = Http::withToken($secretKey)
            ->acceptJson()
            ->get("https://api.clerk.com/v1/users/{$clerkId}")
            ->throw()
            ->json();

        $primaryEmailId = $payload['primary_email_address_id'] ?? null;
        $emailAddress = collect($payload['email_addresses'] ?? [])
            ->firstWhere('id', $primaryEmailId)
            ?? collect($payload['email_addresses'] ?? [])->first();

        $email = $emailAddress['email_address'] ?? null;

        if (! $email) {
            throw new RuntimeException('Clerk user does not have an email address.');
        }

        $name = trim(($payload['first_name'] ?? '').' '.($payload['last_name'] ?? ''));

        return [
            'name' => $name !== '' ? $name : $email,
            'email' => strtolower($email),
        ];
    }
}
