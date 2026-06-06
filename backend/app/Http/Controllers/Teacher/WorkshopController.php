<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Resources\WorkshopResource;
use App\Models\Workshop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkshopController extends Controller
{
    /**
     * POST /api/teacher/workshops
     *
     * Creates a new workshop owned by the authenticated referent.
     *
     * Accepted fields (all map onto the current bilingual schema):
     *   - title_ro       (string, required)
     *   - title_de       (string, optional — defaults to title_ro)
     *   - description_ro (string, optional)
     *   - description_de (string, optional — defaults to description_ro)
     *   - location       (string, optional)
     *   - scheduled_at   (date, optional)
     *   - max_slots      (integer ≥ 1, optional)
     *   - is_active      (boolean, optional — default false)
     *
     * Legacy aliases accepted from the CreateWorkshop form so the UI
     * doesn't need to change in this release:
     *   - title      → title_ro (and title_de if title_de absent)
     *   - description → description_ro / description_de
     *   - capacity   → max_slots
     *   - starts_at  → scheduled_at
     *   - status     → 'published' maps to is_active = true
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            // Canonical bilingual fields
            'title_ro'       => ['sometimes', 'string', 'max:255'],
            'title_de'       => ['sometimes', 'string', 'max:255'],
            'description_ro' => ['sometimes', 'nullable', 'string'],
            'description_de' => ['sometimes', 'nullable', 'string'],
            // Legacy single-language aliases (still used by the current form)
            'title'          => ['sometimes', 'string', 'max:255'],
            'description'    => ['sometimes', 'nullable', 'string'],
            // Shared fields
            'location'       => ['sometimes', 'nullable', 'string', 'max:255'],
            'scheduled_at'   => ['sometimes', 'nullable', 'date', 'after_or_equal:today'],
            'starts_at'      => ['required_without:scheduled_at', 'date', 'after_or_equal:today'], // legacy alias
            'max_slots'      => ['sometimes', 'nullable', 'integer', 'min:1'],
            'capacity'       => ['sometimes', 'nullable', 'integer', 'min:1'], // legacy alias
            'is_active'      => ['sometimes', 'boolean'],
            'status'         => ['sometimes', 'string', 'in:draft,published'], // legacy alias
            'category'       => ['sometimes', 'nullable', 'string', 'max:255'],
            'coordinator_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'coordinator_bio'  => ['sometimes', 'nullable', 'string'],
            'ends_at'        => ['required', 'date', 'after_or_equal:starts_at'],
            'duration'       => ['sometimes', 'nullable', 'string', 'max:255'],
            'cost'           => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'cover_image'    => ['sometimes', 'nullable', 'image', 'mimes:jpeg,png,jpg', 'max:2048'],
            'professor_image' => ['sometimes', 'nullable', 'image', 'mimes:jpeg,png,jpg', 'max:2048'],
        ]);

        // ------------------------------------------------------------------
        // Resolve canonical field values from both aliases and canonical names
        // ------------------------------------------------------------------

        $titleRo    = $request->input('title_ro')    ?? $request->input('title')       ?? '';
        $titleDe    = $request->input('title_de')    ?? $request->input('title_ro')    ?? $request->input('title') ?? $titleRo;
        $descRo     = $request->input('description_ro') ?? $request->input('description');
        $descDe     = $request->input('description_de') ?? $request->input('description_ro') ?? $request->input('description') ?? $descRo;
        $maxSlots   = $request->input('max_slots')   ?? $request->input('capacity');
        $scheduledAt = $request->input('scheduled_at') ?? $request->input('starts_at');

        // is_active: prefer explicit boolean, fall back to status alias
        if ($request->has('is_active')) {
            $isActive = (bool) $request->input('is_active');
        } else {
            $isActive = $request->input('status') === 'published';
        }

        // ------------------------------------------------------------------
        // Handle File Uploads (Base64 conversion)
        // ------------------------------------------------------------------

        $coverImageBase64 = null;
        if ($request->hasFile('cover_image')) {
            $file = $request->file('cover_image');
            $coverImageBase64 = 'data:' . $file->getMimeType() . ';base64,' . base64_encode(file_get_contents($file->path()));
        }

        $professorImageBase64 = null;
        if ($request->hasFile('professor_image')) {
            $file = $request->file('professor_image');
            $professorImageBase64 = 'data:' . $file->getMimeType() . ';base64,' . base64_encode(file_get_contents($file->path()));
        }

        // ------------------------------------------------------------------
        // Persist
        // ------------------------------------------------------------------

        $workshop = Workshop::create([
            'referent_id'    => $request->user()->id,
            'title_ro'       => $titleRo,
            'title_de'       => $titleDe,
            'description_ro' => $descRo,
            'description_de' => $descDe,
            'location'       => $request->input('location'),
            'scheduled_at'   => $scheduledAt,
            'max_slots'      => $maxSlots ? (int) $maxSlots : 0,
            'occupied_slots' => 0,
            'is_active'      => $isActive,
            'category'       => $request->input('category'),
            'coordinator_name' => $request->input('coordinator_name'),
            'coordinator_bio'  => $request->input('coordinator_bio'),
            'ends_at'        => $request->input('ends_at'),
            'duration'       => $request->input('duration'),
            'cost'           => $request->input('cost'),
            'cover_image_base64' => $coverImageBase64,
            'professor_image_base64' => $professorImageBase64,
        ]);

        return response()->json([
            'workshop' => new WorkshopResource($workshop->load('referent')),
        ], 201);
    }
}
