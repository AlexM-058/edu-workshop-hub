<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id'         => $user->id,
                'clerk_id'   => $user->clerk_id,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                'name'       => $user->fullName(),
                'email'      => $user->email,
                'role'       => $user->role,
            ],
            'notifications' => [
                'teacher_invitation_accepted' => (bool) $request->attributes->get('teacher_invitation_accepted', false),
                'teacher_invitation_notice_pending' => (bool) $request->attributes->get('teacher_invitation_notice_pending', false),
            ],
        ]);
    }
}
