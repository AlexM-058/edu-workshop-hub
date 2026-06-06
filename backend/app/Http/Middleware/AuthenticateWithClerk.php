<?php

namespace App\Http\Middleware;

use App\Services\Auth\SyncClerkUser;
use App\Services\Clerk\ClerkTokenVerifier;
use Closure;
use Illuminate\Http\Request;
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
            report($exception);

            return response()->json(['message' => 'Invalid authentication token.'], 401);
        }

        $request->attributes->set('clerk_claims', $claims);
        $request->attributes->set(
            'teacher_invitation_accepted',
            $syncResult['teacher_invitation_accepted'],
        );
        $request->setUserResolver(fn () => $user);

        return $next($request);
    }
}
