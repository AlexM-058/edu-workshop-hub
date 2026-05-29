<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeacherInvitation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TeacherInvitationController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'role' => ['sometimes', Rule::in(['teacher'])],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        $invitation = TeacherInvitation::query()->updateOrCreate(
            ['email' => strtolower($validated['email'])],
            [
                'role' => $validated['role'] ?? 'teacher',
                'invited_by' => $request->user()->id,
                'accepted_at' => null,
                'expires_at' => $validated['expires_at'] ?? null,
            ]
        );

        return response()->json([
            'invitation' => [
                'id' => $invitation->id,
                'email' => $invitation->email,
                'role' => $invitation->role,
                'accepted_at' => $invitation->accepted_at,
                'expires_at' => $invitation->expires_at,
            ],
        ], 201);
    }
}
