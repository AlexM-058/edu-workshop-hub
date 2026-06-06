<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\TeacherInvitation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherInvitationNoticeController extends Controller
{
    public function markSeen(Request $request): JsonResponse
    {
        $user = $request->user();

        $updated = TeacherInvitation::query()
            ->where('email', $user->email)
            ->where('role', 'teacher')
            ->whereNotNull('accepted_at')
            ->whereNull('notice_seen_at')
            ->update(['notice_seen_at' => now()]);

        return response()->json([
            'status' => $updated > 0 ? 'seen' : 'none',
        ]);
    }
}
