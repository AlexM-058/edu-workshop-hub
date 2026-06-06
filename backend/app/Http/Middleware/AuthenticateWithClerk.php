<?php

namespace App\Http\Middleware;

use App\Services\Auth\SyncClerkUser;
use App\Services\Clerk\ClerkTokenVerifier;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateWithClerk
{
    public function __construct(
        private readonly ClerkTokenVerifier $tokens,
        private readonly SyncClerkUser $users,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (! $token) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        try {
            $claims = $this->tokens->verify($token);
            $syncResult = $this->users->sync($claims);
            $user = $syncResult['user'];
        } catch (RuntimeException $exception) {
            Log::warning('Clerk token verification failed.', [
                'reason' => $exception->getMessage(),
                'token_context' => $this->safeTokenContext($token),
                'expected_issuer' => config('services.clerk.issuer'),
                'expected_authorized_parties' => config('services.clerk.authorized_parties', []),
            ]);

            report($exception);

            return response()->json([
                'message' => 'Invalid authentication token: '.$exception->getMessage(),
            ], 401);
        }

        $request->attributes->set('clerk_claims', $claims);
        $request->attributes->set(
            'teacher_invitation_accepted',
            $syncResult['teacher_invitation_accepted'],
        );
        $request->attributes->set(
            'teacher_invitation_notice_pending',
            $syncResult['teacher_invitation_notice_pending'],
        );
        $request->setUserResolver(fn () => $user);

        return $next($request);
    }

    /**
     * Decode non-sensitive JWT metadata for production troubleshooting.
     */
    private function safeTokenContext(string $token): array
    {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return ['shape' => 'malformed'];
        }

        $header = $this->decodeJwtPart($parts[0]);
        $payload = $this->decodeJwtPart($parts[1]);

        return [
            'shape' => 'jwt',
            'alg' => $header['alg'] ?? null,
            'kid' => $header['kid'] ?? null,
            'iss' => $payload['iss'] ?? null,
            'azp' => $payload['azp'] ?? null,
            'has_sub' => isset($payload['sub']),
            'has_email_claim' => isset($payload['email']) || isset($payload['primary_email_address_id']),
        ];
    }

    private function decodeJwtPart(string $value): array
    {
        $decoded = base64_decode(strtr($value, '-_', '+/').str_repeat('=', (4 - strlen($value) % 4) % 4), true);

        if ($decoded === false) {
            return [];
        }

        $json = json_decode($decoded, true);

        return is_array($json) ? $json : [];
    }
}
