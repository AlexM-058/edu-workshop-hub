<?php

namespace App\Http\Controllers\Attender;

use App\Http\Controllers\Controller;
use App\Models\AttendanceQrToken;
use App\Models\Registration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceCheckInController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
        ]);

        $tokenHash = hash('sha256', $data['token']);
        $qrToken = AttendanceQrToken::query()
            ->where('token_hash', $tokenHash)
            ->first();

        if (! $qrToken || $qrToken->expires_at->isPast()) {
            return response()->json([
                'message' => 'QR attendance token has expired.',
            ], 422);
        }

        $result = DB::transaction(function () use ($request, $qrToken): array {
            $registration = Registration::query()
                ->where('workshop_id', $qrToken->workshop_id)
                ->where('user_id', $request->user()->id)
                ->lockForUpdate()
                ->first();

            if (! $registration) {
                abort(response()->json([
                    'message' => 'You are not registered for this workshop.',
                ], 403));
            }

            if ($registration->status === 'cancelled') {
                abort(response()->json([
                    'message' => 'Cancelled registrations cannot check in for this workshop.',
                ], 403));
            }

            if ($registration->status !== 'enrolled') {
                abort(response()->json([
                    'message' => 'Only enrolled attenders can check in for this workshop.',
                ], 403));
            }

            $alreadyConfirmed = $registration->attended;

            if (! $alreadyConfirmed) {
                $registration->forceFill(['attended' => true])->save();
            }

            $registration->certificate()->firstOrCreate([], [
                'file_path' => 'certificates/registration-'.$registration->id.'.pdf',
            ]);

            return [
                'registration' => $registration->refresh(),
                'already_confirmed' => $alreadyConfirmed,
            ];
        });

        return response()->json([
            'status' => $result['already_confirmed'] ? 'already_confirmed' : 'confirmed',
            'message' => $result['already_confirmed']
                ? 'Attendance was already confirmed.'
                : 'Attendance confirmed.',
            'registration' => [
                'id' => $result['registration']->id,
                'workshop_id' => $result['registration']->workshop_id,
                'status' => $result['registration']->status,
                'attended' => $result['registration']->attended,
                'can_download_certificate' => $result['registration']->canDownloadCertificate(),
            ],
        ]);
    }
}
