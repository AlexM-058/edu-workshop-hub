<?php

namespace App\Http\Controllers\Attender;

use App\Http\Controllers\Controller;
use App\Http\Resources\RegistrationResource;
use App\Models\Registration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AttenderController extends Controller
{
    /**
     * GET /api/attender/registrations
     *
     * Returns all of the authenticated professor's registrations
     * (enrolled, waitlist, cancelled), ordered by most recent first.
     *
     * The related workshop and its referent are eager-loaded to avoid N+1.
     *
     * Query params:
     *   - status   (string) filter by 'enrolled' | 'waitlist' | 'cancelled'
     *   - per_page (int, default 12, max 50)
     *   - page     (int, default 1)
     */
    public function registrations(Request $request): AnonymousResourceCollection
    {
        $perPage = max(1, min((int) $request->query('per_page', 12), 50));
        $status  = $request->query('status');

        $query = Registration::query()
            ->where('user_id', $request->user()->id)
            ->with(['workshop.referent', 'certificate'])
            ->orderByDesc('created_at');

        if ($status && in_array($status, ['enrolled', 'waitlist', 'cancelled'], true)) {
            $query->where('status', $status);
        }

        return RegistrationResource::collection($query->paginate($perPage));
    }

    /**
     * GET /api/attender/stats
     *
     * Returns aggregated statistics for the authenticated professor.
     *
     * Response:
     * {
     *   "total_enrolled":   int,   — count of 'enrolled' registrations
     *   "total_waitlist":   int,
     *   "total_attended":   int,   — workshops where attended = true
     *   "total_certificates": int, — certificates available for download
     * }
     */
    public function stats(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $base = Registration::query()->where('user_id', $userId);

        $enrolled     = (clone $base)->where('status', 'enrolled')->count();
        $waitlist     = (clone $base)->where('status', 'waitlist')->count();
        $attended     = (clone $base)->where('attended', true)->count();
        $certificates = (clone $base)
            ->where('attended', true)
            ->whereHas('certificate')
            ->count();

        return response()->json([
            'total_enrolled'     => $enrolled,
            'total_waitlist'     => $waitlist,
            'total_attended'     => $attended,
            'total_certificates' => $certificates,
        ]);
    }

    public function registrationStatus(Request $request, \App\Models\Workshop $workshop): JsonResponse
    {
        $registration = Registration::query()
            ->where('user_id', $request->user()->id)
            ->where('workshop_id', $workshop->id)
            ->first();

        return response()->json([
            'status' => $registration ? $registration->status : null,
        ]);
    }
}
