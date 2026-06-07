<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\AttendanceQrToken;
use App\Models\Workshop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceQrController extends Controller
{
    private const TOKEN_SECONDS = 5;
    private const SESSION_SECONDS = 300;

    public function store(Request $request, Workshop $workshop): JsonResponse
    {
        $this->authorizeWorkshopAccess($request, $workshop);

        $now = now();
        $activeSession = AttendanceQrToken::query()
            ->where('workshop_id', $workshop->id)
            ->where('session_expires_at', '>', $now)
            ->latest('session_expires_at')
            ->first();

        $sessionExpiresAt = $activeSession?->session_expires_at ?? $now->copy()->addSeconds(self::SESSION_SECONDS);
        $tokenExpiresAt = $now->copy()->addSeconds(self::TOKEN_SECONDS);

        if ($tokenExpiresAt->greaterThan($sessionExpiresAt)) {
            $tokenExpiresAt = $sessionExpiresAt->copy();
        }

        $rawToken = bin2hex(random_bytes(32));

        AttendanceQrToken::create([
            'workshop_id' => $workshop->id,
            'token_hash' => hash('sha256', $rawToken),
            'expires_at' => $tokenExpiresAt,
            'session_expires_at' => $sessionExpiresAt,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'token' => $rawToken,
            'check_in_url' => $this->checkInUrl($rawToken),
            'expires_at' => $tokenExpiresAt->toJSON(),
            'session_expires_at' => $sessionExpiresAt->toJSON(),
            'refresh_after_seconds' => self::TOKEN_SECONDS,
        ], 201);
    }

    private function authorizeWorkshopAccess(Request $request, Workshop $workshop): void
    {
        $user = $request->user();

        abort_unless(
            $user->role === 'admin'
                || $workshop->referent_id === $user->id
                || $workshop->teacher_id === $user->id,
            404
        );
    }

    private function checkInUrl(string $token): string
    {
        $frontendUrl = rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/');

        return $frontendUrl.'/attendance/check-in?token='.rawurlencode($token);
    }
}
