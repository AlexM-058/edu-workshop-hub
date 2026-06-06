<?php

namespace App\Http\Controllers\Attender;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use App\Models\Workshop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WorkshopEnrollmentController extends Controller
{
    /**
     * POST /api/workshops/{workshop}/enroll
     *
     * Enrols the authenticated attender in a workshop.
     * If the workshop is full, places them on the waiting list
     * (preserving first-come, first-served order via created_at / waitlist_position).
     *
     * Business rules:
     *   - Workshop must be active (is_active = true).
     *   - A user may not enrol twice (409 Conflict).
     *   - If max_slots = 0, the workshop has unlimited capacity.
     */
    public function store(Request $request, Workshop $workshop): JsonResponse
    {
        $enrollment = DB::transaction(function () use ($request, $workshop): Registration {
            $locked = Workshop::query()
                ->whereKey($workshop->id)
                ->lockForUpdate()
                ->firstOrFail();

            if (! $locked->is_active) {
                abort(response()->json([
                    'message' => 'Enrollment is only available for published workshops.',
                ], 422));
            }

            $alreadyParticipating = Registration::query()
                ->where('workshop_id', $locked->id)
                ->where('user_id', $request->user()->id)
                ->whereIn('status', ['enrolled', 'waitlist'])
                ->exists();

            if ($alreadyParticipating) {
                abort(response()->json([
                    'message' => 'You are already enrolled or waiting for this workshop.',
                ], 409));
            }

            $enrolledCount = Registration::query()
                ->where('workshop_id', $locked->id)
                ->where('status', 'enrolled')
                ->count();

            // Unlimited capacity when max_slots is 0 or null
            $hasCapacity = $locked->max_slots === 0
                || $locked->max_slots === null
                || $enrolledCount < $locked->max_slots;

            if ($hasCapacity) {
                return Registration::create([
                    'workshop_id' => $locked->id,
                    'user_id'     => $request->user()->id,
                    'status'      => 'enrolled',
                    'attended'    => false,
                ]);
            }

            $nextPosition = ((int) Registration::query()
                ->where('workshop_id', $locked->id)
                ->where('status', 'waitlist')
                ->max('created_at')) + 1; // fallback counter via count

            $nextPosition = Registration::query()
                ->where('workshop_id', $locked->id)
                ->where('status', 'waitlist')
                ->count() + 1;

            return Registration::create([
                'workshop_id'       => $locked->id,
                'user_id'           => $request->user()->id,
                'status'            => 'waitlist',
                'attended'          => false,
            ]);
        });

        return response()->json([
            'enrollment' => [
                'id'               => $enrollment->id,
                'workshop_id'      => $enrollment->workshop_id,
                'user_id'          => $enrollment->user_id,
                'status'           => $enrollment->status,
                'waitlist_position' => $enrollment->status === 'waitlist'
                    ? Registration::query()
                        ->where('workshop_id', $enrollment->workshop_id)
                        ->where('status', 'waitlist')
                        ->where('id', '<=', $enrollment->id)
                        ->count()
                    : null,
            ],
        ], 201);
    }
}
