<?php

namespace App\Http\Controllers\Attender;

use App\Http\Controllers\Controller;
use App\Models\Workshop;
use App\Models\WorkshopEnrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WorkshopEnrollmentController extends Controller
{
    public function store(Request $request, Workshop $workshop): JsonResponse
    {
        $enrollment = DB::transaction(function () use ($request, $workshop): WorkshopEnrollment {
            $lockedWorkshop = Workshop::query()
                ->whereKey($workshop->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedWorkshop->status !== 'published') {
                abort(response()->json([
                    'message' => 'Enrollment is only available for published workshops.',
                ], 422));
            }

            $alreadyParticipating = WorkshopEnrollment::query()
                ->where('workshop_id', $lockedWorkshop->id)
                ->where('user_id', $request->user()->id)
                ->exists();

            if ($alreadyParticipating) {
                abort(response()->json([
                    'message' => 'You are already enrolled or waiting for this workshop.',
                ], 409));
            }

            $enrolledCount = WorkshopEnrollment::query()
                ->where('workshop_id', $lockedWorkshop->id)
                ->where('status', 'enrolled')
                ->count();

            if ($lockedWorkshop->capacity === null || $enrolledCount < $lockedWorkshop->capacity) {
                return WorkshopEnrollment::create([
                    'workshop_id' => $lockedWorkshop->id,
                    'user_id' => $request->user()->id,
                    'status' => 'enrolled',
                ]);
            }

            $nextPosition = ((int) WorkshopEnrollment::query()
                ->where('workshop_id', $lockedWorkshop->id)
                ->where('status', 'waiting')
                ->max('waitlist_position')) + 1;

            return WorkshopEnrollment::create([
                'workshop_id' => $lockedWorkshop->id,
                'user_id' => $request->user()->id,
                'status' => 'waiting',
                'waitlist_position' => $nextPosition,
            ]);
        });

        return response()->json([
            'enrollment' => $enrollment,
        ], 201);
    }
}
