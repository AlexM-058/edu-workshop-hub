<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Workshop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class WorkshopController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'coordinator_name' => ['nullable', 'string', 'max:255'],
            'coordinator_bio' => ['nullable', 'string'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'duration' => ['nullable', 'string', 'max:255'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'location' => ['nullable', 'string', 'max:255'],
            'status' => ['required', Rule::in(['draft', 'published'])],
        ]);

        $workshop = Workshop::create([
            ...$validated,
            'teacher_id' => $request->user()->id,
            'referent_id' => $request->user()->id,
            'title_ro' => $validated['title'],
            'title_de' => $validated['title'],
            'description_ro' => $validated['description'],
            'description_de' => $validated['description'],
            'max_slots' => $validated['capacity'] ?? null,
            'scheduled_at' => $validated['starts_at'] ?? null,
            'is_active' => $validated['status'] === 'published',
        ]);

        return response()->json([
            'workshop' => $workshop,
        ], 201);
    }
}
