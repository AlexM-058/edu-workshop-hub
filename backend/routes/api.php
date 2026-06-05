<?php

use App\Http\Controllers\Admin\TeacherInvitationController;
use App\Http\Controllers\Auth\MeController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'backend',
    ]);
});

Route::middleware('clerk.auth')->group(function (): void {
    Route::get('/auth/me', MeController::class);
    Route::middleware('role:referent,admin')->get('/teacher/status', fn () => response()->json(['status' => 'ok']));

    Route::middleware('role:admin')->post('/admin/teacher-invitations', [TeacherInvitationController::class, 'store']);
});
