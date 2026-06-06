<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\TeacherInvitationController;
use App\Http\Controllers\Attender\WorkshopEnrollmentController;
use App\Http\Controllers\Auth\MeController;
use App\Http\Controllers\Attender\AttenderController;
use App\Http\Controllers\Teacher\WorkshopController as TeacherWorkshopCreationController;
use App\Http\Controllers\Workshops\TeacherWorkshopController;
use App\Http\Controllers\Workshops\WorkshopController as CatalogWorkshopController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'backend',
    ]);
});

// Public workshop catalog — no authentication required
Route::get('/workshops', [CatalogWorkshopController::class, 'index']);
Route::get('/workshops/{workshop}', [CatalogWorkshopController::class, 'show']);

Route::middleware('clerk.auth')->group(function (): void {
    Route::get('/auth/me', MeController::class);

    // Teacher endpoints — accept canonical teacher and legacy referent roles while old data is migrated.
    Route::middleware('role:teacher,referent,admin')->group(function (): void {
        Route::get('/teacher/status', fn () => response()->json(['status' => 'ok']));
        Route::get('/teacher/workshops', [TeacherWorkshopController::class, 'index']);
        Route::post('/teacher/workshops', [TeacherWorkshopCreationController::class, 'store']);
        Route::get('/teacher/stats', [TeacherWorkshopController::class, 'stats']);
    });

    // Attender endpoints — accept canonical attender and legacy professor roles while old data is migrated.
    Route::middleware('role:attender,professor,admin')->group(function (): void {
        Route::get('/attender/registrations', [AttenderController::class, 'registrations']);
        Route::get('/attender/stats', [AttenderController::class, 'stats']);
    });

    Route::middleware('role:attender')->post('/workshops/{workshop}/enroll', [WorkshopEnrollmentController::class, 'store']);

    // Admin endpoints — requires admin role
    Route::middleware('role:admin')->group(function (): void {
        Route::post('/admin/teacher-invitations', [TeacherInvitationController::class, 'store']);
        Route::get('/admin/users', [AdminController::class, 'users']);
        Route::get('/admin/stats', [AdminController::class, 'stats']);
    });
});
