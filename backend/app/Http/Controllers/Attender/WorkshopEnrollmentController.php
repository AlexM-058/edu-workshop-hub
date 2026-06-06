<?php

namespace App\Http\Controllers\Attender;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use App\Models\Workshop;
use App\Support\SimplePdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class WorkshopEnrollmentController extends Controller
{
    /**
     * POST /api/workshops/{workshop}/enroll
     *
     * Enrols the authenticated attender in a workshop.
     * If the workshop is full, places them on the waiting list
     * (preserving first-come, first-served order via created_at).
     *
     * Business rules:
     *   - Workshop must be active (is_active = true).
     *   - A user may not enrol twice unless their previous registration was cancelled.
     *   - If max_slots = 0 or null, the workshop has unlimited capacity.
     */
    public function store(Request $request, Workshop $workshop): JsonResponse
    {
        $registration = DB::transaction(function () use ($request, $workshop): Registration {
            $lockedWorkshop = Workshop::query()
                ->whereKey($workshop->id)
                ->lockForUpdate()
                ->firstOrFail();

            if (! $lockedWorkshop->is_active) {
                abort(response()->json([
                    'message' => 'Enrollment is only available for published workshops.',
                ], 422));
            }

            $existing = Registration::query()
                ->where('workshop_id', $lockedWorkshop->id)
                ->where('user_id', $request->user()->id)
                ->first();

            if ($existing && $existing->status !== 'cancelled') {
                abort(response()->json([
                    'message' => 'You are already enrolled or waiting for this workshop.',
                ], 409));
            }

            $enrolledCount = Registration::query()
                ->where('workshop_id', $lockedWorkshop->id)
                ->where('status', 'enrolled')
                ->count();

            // max_slots = 0 or null means unlimited capacity
            $capacity = ($lockedWorkshop->max_slots === 0 || $lockedWorkshop->max_slots === null)
                ? null
                : $lockedWorkshop->max_slots;

            $status = ($capacity === null || $enrolledCount < $capacity) ? 'enrolled' : 'waitlist';

            // Re-use a cancelled registration record if one exists
            $registration = $existing ?? new Registration([
                'workshop_id' => $lockedWorkshop->id,
                'user_id'     => $request->user()->id,
            ]);

            $registration->forceFill([
                'status'   => $status,
                'attended' => false,
            ])->save();

            if ($status === 'enrolled') {
                $lockedWorkshop->forceFill([
                    'occupied_slots' => $enrolledCount + 1,
                ])->save();
            }

            return $registration->refresh();
        });

        return response()->json([
            'enrollment' => $this->registrationPayload($registration),
        ], 201);
    }

    /**
     * DELETE /api/attender/registrations/{registration}
     *
     * Cancels a registration. If the cancelled slot was enrolled,
     * the first waitlisted attender (FIFO) is automatically promoted.
     */
    public function destroy(Request $request, Registration $registration): JsonResponse
    {
        abort_unless($registration->user_id === $request->user()->id, 404);

        $result = DB::transaction(function () use ($registration): array {
            $lockedRegistration = Registration::query()
                ->whereKey($registration->id)
                ->lockForUpdate()
                ->firstOrFail();

            $lockedWorkshop = Workshop::query()
                ->whereKey($lockedRegistration->workshop_id)
                ->lockForUpdate()
                ->firstOrFail();

            $wasEnrolled = $lockedRegistration->status === 'enrolled';

            $lockedRegistration->forceFill([
                'status'   => 'cancelled',
                'attended' => false,
            ])->save();

            $lockedRegistration->certificate()->delete();

            $promoted = null;
            if ($wasEnrolled) {
                $promoted = Registration::query()
                    ->where('workshop_id', $lockedWorkshop->id)
                    ->where('status', 'waitlist')
                    ->orderBy('created_at')
                    ->orderBy('id')
                    ->lockForUpdate()
                    ->first();

                if ($promoted) {
                    $promoted->forceFill(['status' => 'enrolled'])->save();
                } else {
                    $lockedWorkshop->forceFill([
                        'occupied_slots' => max(0, (int) $lockedWorkshop->occupied_slots - 1),
                    ])->save();
                }
            }

            return [
                'registration' => $lockedRegistration->refresh(),
                'promoted'     => $promoted?->refresh(),
            ];
        });

        return response()->json([
            'registration' => $this->registrationPayload($result['registration']),
            'promoted'     => $result['promoted'] ? $this->registrationPayload($result['promoted']) : null,
        ]);
    }

    /**
     * GET /api/attender/registrations/{registration}/certificate
     *
     * Downloads a PDF participation certificate.
     * Only available when attendance has been confirmed by a teacher.
     */
    public function certificate(Request $request, Registration $registration): Response
    {
        abort_unless($registration->user_id === $request->user()->id, 404);
        abort_unless($registration->canDownloadCertificate(), 404);

        $registration->loadMissing(['workshop', 'user']);
        $title = $registration->workshop?->title_ro ?? 'Workshop';
        $name  = $registration->user?->fullName() ?? 'Participant';

        $pdf = SimplePdf::fromLines([
            'Participation Certificate',
            'Participant: ' . $name,
            'Workshop: ' . $title,
        ]);

        return response($pdf, 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="certificate-' . $registration->id . '.pdf"',
        ]);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private function registrationPayload(Registration $registration): array
    {
        $waitlistPosition = null;

        if ($registration->status === 'waitlist') {
            $waitlistPosition = Registration::query()
                ->where('workshop_id', $registration->workshop_id)
                ->where('status', 'waitlist')
                ->where(function ($query) use ($registration): void {
                    $query->where('created_at', '<', $registration->created_at)
                        ->orWhere(function ($query) use ($registration): void {
                            $query->where('created_at', $registration->created_at)
                                  ->where('id', '<=', $registration->id);
                        });
                })
                ->count();
        }

        return [
            'id'                       => $registration->id,
            'workshop_id'              => $registration->workshop_id,
            'user_id'                  => $registration->user_id,
            'status'                   => $registration->status,
            'waitlist_position'        => $waitlistPosition,
            'attended'                 => $registration->attended,
            'can_download_certificate' => $registration->canDownloadCertificate(),
        ];
    }
}
