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
            'email'      => ['required', 'email'],
            'role'       => ['sometimes', Rule::in(['teacher', 'referent'])],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        $email = strtolower($validated['email']);
        $invitation = TeacherInvitation::query()->where('email', $email)->first();
        $wasCreated = $invitation === null;
        $httpStatus = $wasCreated ? 201 : 200;

        if (! $invitation) {
            $invitation = new TeacherInvitation(['email' => $email]);
        }

        if ($invitation->accepted_at === null) {
            $invitation->fill([
                'role'       => 'teacher',
                'invited_by' => $request->user()->id,
                'expires_at' => $validated['expires_at'] ?? null,
            ]);
            $invitation->save();
        }

        return response()->json([
            'status' => $wasCreated ? 'created' : 'existing',
            'invitation' => [
                'id' => $invitation->id,
                'email' => $invitation->email,
                'role' => $invitation->role,
                'accepted_at' => $invitation->accepted_at,
                'expires_at' => $invitation->expires_at,
            ],
        ], $httpStatus);
    }
}
