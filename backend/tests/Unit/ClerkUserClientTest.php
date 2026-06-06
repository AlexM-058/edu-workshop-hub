<?php

namespace Tests\Unit;

use App\Services\Clerk\ClerkUserClient;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Tests\TestCase;

class ClerkUserClientTest extends TestCase
{
    public function test_profile_from_claims_uses_email_and_normalizes_case(): void
    {
        $profile = (new ClerkUserClient())->profileFromClaims([
            'email' => 'Teacher@Example.COM',
            'name' => 'Tina Teacher',
            'sub' => 'user_123',
        ]);

        $this->assertSame([
            'name' => 'Tina Teacher',
            'email' => 'teacher@example.com',
        ], $profile);
    }

    public function test_profile_from_claims_builds_name_from_given_and_family_name(): void
    {
        $profile = (new ClerkUserClient())->profileFromClaims([
            'primary_email_address' => 'ana@example.com',
            'given_name' => 'Ana',
            'family_name' => 'Pop',
            'sub' => 'user_123',
        ]);

        $this->assertSame([
            'name' => 'Ana Pop',
            'email' => 'ana@example.com',
        ], $profile);
    }

    public function test_profile_from_api_requires_secret_key_when_claims_do_not_include_email(): void
    {
        config(['services.clerk.secret_key' => null]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('CLERK_SECRET_KEY is required');

        (new ClerkUserClient())->profileFromClaims(['sub' => 'user_without_email']);
    }

    public function test_profile_from_api_fetches_primary_email_and_name(): void
    {
        config(['services.clerk.secret_key' => 'sk_test_123']);

        Http::fake([
            'https://api.clerk.com/v1/users/user_api' => Http::response([
                'first_name' => 'Mara',
                'last_name' => 'Ionescu',
                'primary_email_address_id' => 'email_2',
                'email_addresses' => [
                    ['id' => 'email_1', 'email_address' => 'old@example.com'],
                    ['id' => 'email_2', 'email_address' => 'Mara@Example.COM'],
                ],
            ]),
        ]);

        $profile = (new ClerkUserClient())->profileFromClaims(['sub' => 'user_api']);

        $this->assertSame([
            'name' => 'Mara Ionescu',
            'email' => 'mara@example.com',
        ], $profile);

        Http::assertSent(fn ($request) => $request->hasHeader('Authorization', 'Bearer sk_test_123'));
    }

    public function test_profile_from_api_throws_when_user_has_no_email(): void
    {
        config(['services.clerk.secret_key' => 'sk_test_123']);

        Http::fake([
            'https://api.clerk.com/v1/users/user_api' => Http::response([
                'first_name' => 'No',
                'last_name' => 'Email',
                'email_addresses' => [],
            ]),
        ]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Clerk user does not have an email address.');

        (new ClerkUserClient())->profileFromClaims(['sub' => 'user_api']);
    }
}
