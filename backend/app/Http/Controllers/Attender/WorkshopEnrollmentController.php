<?php

namespace App\Http\Controllers\Attender;

use App\Http\Controllers\Controller;
use App\Mail\WaitlistPromotionMail;
use App\Mail\WorkshopEnrollmentMail;
use App\Models\Registration;
use App\Models\Workshop;
use App\Support\SimplePdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Barryvdh\DomPDF\Facade\Pdf;
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

            if ($existing) {
                if ($existing->status === 'cancelled') {
                    // Allowed to re-enroll. Delete old cancelled registration to reset position.
                    $existing->delete();
                } else {
                    abort(response()->json([
                        'message' => 'You are already enrolled or waiting for this workshop.',
                    ], 409));
                }
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

            $registration = new Registration([
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

                Mail::to($request->user()->email)->send(new WorkshopEnrollmentMail($lockedWorkshop));
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

            if ($lockedWorkshop->scheduled_at) {
                $startsAt = \Carbon\Carbon::parse($lockedWorkshop->scheduled_at);
                if (now()->addHours(24)->isAfter($startsAt)) {
                    abort(response()->json([
                        'message' => 'Nu te poți retrage cu mai puțin de 24 de ore înainte de începerea cursului.',
                    ], 403));
                }
            }

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

                    $promoted->loadMissing('user');
                    if ($promoted->user && $promoted->user->email) {
                        Mail::to($promoted->user->email)->send(new WaitlistPromotionMail($lockedWorkshop));
                    }
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
     * GET /api/workshops/{workshop}/certificate
     *
     * Downloads a PDF participation certificate for the authenticated user.
     * Only available when:
     * - The user is enrolled.
     * - The user has attended the workshop (attendance confirmed by teacher).
     * - The workshop has ended.
     */
    public function downloadCertificate(Request $request, Workshop $workshop): Response
    {
        $registration = Registration::query()
            ->where('workshop_id', $workshop->id)
            ->where('user_id', $request->user()->id)
            ->first();

        abort_unless($registration && $registration->status === 'enrolled', 403, 'Nu sunteți înscris la acest workshop.');
        abort_unless($registration->attended, 403, 'Prezența nu a fost confirmată.');
        
        if ($workshop->ends_at) {
            abort_unless(now()->isAfter($workshop->ends_at), 403, 'Workshop-ul nu s-a încheiat încă.');
        }

        $registration->loadMissing(['user']);
        $workshop->loadMissing(['referent']);

        $pdf = Pdf::loadView('certificate', [
            'registration' => $registration,
            'workshop' => $workshop,
        ]);

        return $pdf->download('certificat_participare_' . $workshop->id . '.pdf');
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
