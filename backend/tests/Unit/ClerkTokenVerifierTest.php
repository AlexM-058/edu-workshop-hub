<?php

namespace Tests\Unit;

use App\Services\Clerk\ClerkTokenVerifier;
use RuntimeException;
use Tests\TestCase;

class ClerkTokenVerifierTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.clerk.allow_test_tokens' => true,
            'services.clerk.authorized_parties' => ['http://localhost:5173'],
            'services.clerk.issuer' => 'https://clerk.example.test',
        ]);
    }

    public function test_verifies_allowed_test_token_and_returns_claims(): void
    {
        $claims = [
            'sub' => 'user_123',
            'email' => 'attender@example.com',
            'iss' => 'https://clerk.example.test',
            'azp' => 'http://localhost:5173',
            'exp' => time() + 3600,
            'nbf' => time() - 60,
        ];

        $this->assertSame($claims, (new ClerkTokenVerifier())->verify($this->testToken($claims)));
    }

    public function test_rejects_invalid_test_token_payload(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Invalid test auth token.');

        (new ClerkTokenVerifier())->verify('test:not-json');
    }

    public function test_rejects_expired_claims(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Expired Clerk JWT.');

        (new ClerkTokenVerifier())->verify($this->testToken([
            'sub' => 'user_123',
            'iss' => 'https://clerk.example.test',
            'exp' => time() - 1,
        ]));
    }

    public function test_rejects_tokens_before_not_before_time(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Clerk JWT is not yet valid.');

        (new ClerkTokenVerifier())->verify($this->testToken([
            'sub' => 'user_123',
            'iss' => 'https://clerk.example.test',
            'nbf' => time() + 60,
        ]));
    }

    public function test_rejects_invalid_issuer_and_authorized_party(): void
    {
        try {
            (new ClerkTokenVerifier())->verify($this->testToken([
                'sub' => 'user_123',
                'iss' => 'https://wrong.example.test',
            ]));
            $this->fail('Expected invalid issuer exception.');
        } catch (RuntimeException $exception) {
            $this->assertSame('Invalid Clerk JWT issuer.', $exception->getMessage());
        }

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Invalid Clerk authorized party.');

        (new ClerkTokenVerifier())->verify($this->testToken([
            'sub' => 'user_123',
            'iss' => 'https://clerk.example.test',
            'azp' => 'http://evil.localhost',
        ]));
    }

    public function test_rejects_malformed_non_test_jwt(): void
    {
        config(['services.clerk.allow_test_tokens' => false]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Malformed Clerk JWT.');

        (new ClerkTokenVerifier())->verify('not-a-jwt');
    }

    private function testToken(array $claims): string
    {
        return 'test:'.base64_encode(json_encode($claims, JSON_THROW_ON_ERROR));
    }
}
