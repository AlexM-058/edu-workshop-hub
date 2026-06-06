<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\TeacherInvitationController;
use App\Http\Controllers\Attender\AttenderController;
use App\Http\Controllers\Auth\MeController;
use App\Http\Controllers\Workshops\TeacherWorkshopController;
use App\Http\Controllers\Workshops\WorkshopController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'backend',
    ]);
});

// Public workshop catalog — no authentication required
Route::get('/workshops', [WorkshopController::class, 'index']);
Route::get('/workshops/{workshop}', [WorkshopController::class, 'show']);

Route::middleware('clerk.auth')->group(function (): void {
    Route::get('/auth/me', MeController::class);

    // Teacher (referent) endpoints — requires referent or admin role
    Route::middleware('role:referent,admin')->group(function (): void {
        Route::get('/teacher/status', fn () => response()->json(['status' => 'ok']));
        Route::get('/teacher/workshops', [TeacherWorkshopController::class, 'index']);
        Route::get('/teacher/stats', [TeacherWorkshopController::class, 'stats']);
    });

    // Attender (professor) endpoints — requires professor or admin role
    Route::middleware('role:professor,admin')->group(function (): void {
        Route::get('/attender/registrations', [AttenderController::class, 'registrations']);
        Route::get('/attender/stats', [AttenderController::class, 'stats']);
    });

    // Admin endpoints — requires admin role
    Route::middleware('role:admin')->group(function (): void {
        Route::post('/admin/teacher-invitations', [TeacherInvitationController::class, 'store']);
        Route::get('/admin/users', [AdminController::class, 'users']);
        Route::get('/admin/stats', [AdminController::class, 'stats']);
    });
});
