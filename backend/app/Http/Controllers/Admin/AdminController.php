<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use App\Models\User;
use App\Models\Workshop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * GET /api/admin/users
     *
     * Paginated list of all platform users with basic profile and role info.
     * Supports optional ?role=attender|teacher|admin filter.
     *
     * Query params:
     *   - role     (string) filter by exact role value
     *   - per_page (int, default 20, max 100)
     *   - page     (int, default 1)
     */
    public function users(Request $request): JsonResponse
    {
        $perPage = max(1, min((int) $request->query('per_page', 20), 100));
        $role    = $request->query('role');

        $query = User::query()->orderBy('last_name')->orderBy('first_name');

        if ($role && in_array($role, ['attender', 'teacher', 'admin', 'professor', 'referent'], true)) {
            $query->where('role', $role);
        }

        $paginated = $query->paginate($perPage);

        return response()->json([
            'data' => $paginated->getCollection()->map(fn (User $u) => [
                'id'         => $u->id,
                'name'       => $u->fullName(),
                'email'      => $u->email,
                'role'       => $u->role,
                'created_at' => $u->created_at->toIso8601String(),
            ]),
            'meta' => [
                'total'        => $paginated->total(),
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
            ],
        ]);
    }

    /**
     * GET /api/admin/stats
     *
     * Platform-wide aggregated statistics for the admin audit dashboard.
     *
     * Response:
     * {
     *   "total_users":       int,
     *   "total_professors":  int,
     *   "total_referents":   int,
     *   "total_workshops":   int,
     *   "active_workshops":  int,
     *   "total_enrolled":    int,   — registrations with status = 'enrolled'
     *   "total_attended":    int,   — registrations with attended = true
     * }
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'total_users'      => User::count(),
            'total_professors' => User::whereIn('role', ['attender', 'professor'])->count(),
            'total_referents'  => User::whereIn('role', ['teacher', 'referent'])->count(),
            'total_workshops'  => Workshop::count(),
            'active_workshops' => Workshop::active()->count(),
            'total_enrolled'   => Registration::where('status', 'enrolled')->count(),
            'total_attended'   => Registration::where('attended', true)->count(),
        ]);
    }
}
