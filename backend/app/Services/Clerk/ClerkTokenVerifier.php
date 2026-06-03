<?php

namespace App\Services\Clerk;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class ClerkTokenVerifier
{
    public function verify(string $token): array
    {
        if (config('services.clerk.allow_test_tokens') && str_starts_with($token, 'test:')) {
            return $this->decodeTestToken($token);
        }

        [$header, $payload, $signature, $signedPayload] = $this->parseJwt($token);

        if (($header['alg'] ?? null) !== 'RS256') {
            throw new RuntimeException('Unsupported Clerk JWT algorithm.');
        }

        $verified = openssl_verify(
            $signedPayload,
            $signature,
            $this->publicKeyFor((string) ($header['kid'] ?? '')),
            OPENSSL_ALGO_SHA256
        );

        if ($verified !== 1) {
            throw new RuntimeException('Invalid Clerk JWT signature.');
        }

        $this->validateClaims($payload);

        return $payload;
    }

    private function parseJwt(string $token): array
    {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            throw new RuntimeException('Malformed Clerk JWT.');
        }

        $header = json_decode($this->base64UrlDecode($parts[0]), true);
        $payload = json_decode($this->base64UrlDecode($parts[1]), true);

        if (! is_array($header) || ! is_array($payload)) {
            throw new RuntimeException('Invalid Clerk JWT JSON.');
        }

        return [$header, $payload, $this->base64UrlDecode($parts[2]), $parts[0].'.'.$parts[1]];
    }

    private function validateClaims(array $payload): void
    {
        $now = time();

        if (isset($payload['exp']) && (int) $payload['exp'] <= $now) {
            throw new RuntimeException('Expired Clerk JWT.');
        }

        if (isset($payload['nbf']) && (int) $payload['nbf'] > $now) {
            throw new RuntimeException('Clerk JWT is not yet valid.');
        }

        $issuer = config('services.clerk.issuer');
        if ($issuer && ($payload['iss'] ?? null) !== $issuer) {
            throw new RuntimeException('Invalid Clerk JWT issuer.');
        }

        $authorizedParties = config('services.clerk.authorized_parties', []);
        if ($authorizedParties !== [] && isset($payload['azp']) && ! in_array($payload['azp'], $authorizedParties, true)) {
            throw new RuntimeException('Invalid Clerk authorized party.');
        }
    }

    private function publicKeyFor(string $kid): string
    {
        if ($kid === '') {
            throw new RuntimeException('Missing Clerk JWT key id.');
        }

        $jwksUrl = config('services.clerk.jwks_url');

        if (! $jwksUrl) {
            throw new RuntimeException('CLERK_JWKS_URL is not configured.');
        }

        $jwks = Cache::remember('clerk.jwks', now()->addHour(), fn () => Http::acceptJson()
            ->get($jwksUrl)
            ->throw()
            ->json());

        $key = collect($jwks['keys'] ?? [])->firstWhere('kid', $kid);

        if (! $key || ($key['kty'] ?? null) !== 'RSA') {
            throw new RuntimeException('Matching Clerk JWK was not found.');
        }

        return $this->rsaJwkToPem($key);
    }

    private function rsaJwkToPem(array $jwk): string
    {
        $modulus = $this->base64UrlDecode((string) $jwk['n']);
        $exponent = $this->base64UrlDecode((string) $jwk['e']);
        $sequence = $this->asn1Sequence($this->asn1Integer($modulus).$this->asn1Integer($exponent));
        $bitString = "\x03".$this->asn1Length(strlen($sequence) + 1)."\x00".$sequence;
        $algorithm = hex2bin('300d06092a864886f70d0101010500');
        $publicKey = $this->asn1Sequence($algorithm.$bitString);

        return "-----BEGIN PUBLIC KEY-----\n".
            chunk_split(base64_encode($publicKey), 64, "\n").
            "-----END PUBLIC KEY-----\n";
    }

    private function asn1Integer(string $value): string
    {
        $value = ltrim($value, "\x00");

        if ($value === '' || (ord($value[0]) & 0x80)) {
            $value = "\x00".$value;
        }

        return "\x02".$this->asn1Length(strlen($value)).$value;
    }

    private function asn1Sequence(string $value): string
    {
        return "\x30".$this->asn1Length(strlen($value)).$value;
    }

    private function asn1Length(int $length): string
    {
        if ($length < 128) {
            return chr($length);
        }

        $hex = dechex($length);
        if (strlen($hex) % 2 === 1) {
            $hex = '0'.$hex;
        }

        $bytes = hex2bin($hex);

        return chr(0x80 | strlen($bytes)).$bytes;
    }

    private function base64UrlDecode(string $value): string
    {
        return base64_decode(strtr($value, '-_', '+/').str_repeat('=', (4 - strlen($value) % 4) % 4), true) ?: '';
    }

    private function decodeTestToken(string $token): array
    {
        $payload = json_decode(base64_decode(substr($token, 5), true) ?: '', true);

        if (! is_array($payload)) {
            throw new RuntimeException('Invalid test auth token.');
        }

        $this->validateClaims($payload);

        return $payload;
    }
}
