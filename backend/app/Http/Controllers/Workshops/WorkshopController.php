<?php

namespace App\Http\Controllers\Workshops;

use App\Http\Controllers\Controller;
use App\Http\Resources\WorkshopResource;
use App\Models\Workshop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class WorkshopController extends Controller
{
    /**
     * GET /api/workshops
     *
     * Returns a paginated list of active workshops.
     *
     * Query params:
     *   - per_page  (int, default 12, max 50)
     *   - page      (int, default 1)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min((int) $request->query('per_page', 12), 50);

        $workshops = Workshop::query()
            ->active()
            ->with('referent')
            ->orderBy('scheduled_at')
            ->paginate($perPage);

        return WorkshopResource::collection($workshops);
    }

    /**
     * GET /api/workshops/{workshop}
     *
     * Returns a single workshop by ID (only if active).
     */
    public function show(Workshop $workshop): WorkshopResource|JsonResponse
    {
        if (! $workshop->is_active) {
            return response()->json(['message' => 'Workshop not found.'], 404);
        }

        $workshop->load('referent');

        return new WorkshopResource($workshop);
    }
}
