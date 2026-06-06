<?php

namespace App\Http\Controllers\Workshops;

use App\Http\Controllers\Controller;
use App\Http\Resources\WorkshopResource;
use App\Models\Workshop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TeacherWorkshopController extends Controller
{
    /**
     * GET /api/teacher/workshops
     *
     * Returns a paginated list of workshops owned by the authenticated referent,
     * ordered by most recently created first.
     *
     * Query params:
     *   - per_page (int, default 12, max 50)
     *   - page     (int, default 1)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = max(1, min((int) $request->query('per_page', 12), 50));

        $workshops = Workshop::query()
            ->where('referent_id', $request->user()->id)
            ->with('referent')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return WorkshopResource::collection($workshops);
    }

    /**
     * GET /api/teacher/stats
     *
     * Returns aggregated statistics for the authenticated referent's workshops.
     *
     * Response shape:
     * {
     *   "total_workshops":  int,
     *   "active_workshops": int,
     *   "total_enrolled":   int,
     *   "total_capacity":   int,
     * }
     */
    public function stats(Request $request): JsonResponse
    {
        $base = Workshop::query()
            ->where('referent_id', $request->user()->id);

        $total   = (clone $base)->count();
        $active  = (clone $base)->where('is_active', true)->count();
        $enrolled = (clone $base)->sum('occupied_slots');
        $capacity = (clone $base)->sum('max_slots');

        return response()->json([
            'total_workshops'  => $total,
            'active_workshops' => $active,
            'total_enrolled'   => (int) $enrolled,
            'total_capacity'   => (int) $capacity,
        ]);
    }
}
