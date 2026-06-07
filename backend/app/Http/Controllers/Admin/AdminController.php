<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\TeacherRoleMail;
use App\Mail\WaitlistPromotionMail;
use App\Models\Category;
use App\Models\Certificate;
use App\Models\Registration;
use App\Models\TeacherInvitation;
use App\Models\User;
use App\Models\Workshop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class AdminController extends Controller
{
    /**
     * GET /api/admin/users
     *
     * Paginated list of all platform users with basic profile and role info.
     * Supports optional ?role=attender|teacher|admin filter.
     *
     * Query params:
     *   - role     (string) filter by exact role value
     *   - per_page (int, default 20, max 100)
     *   - page     (int, default 1)
     */
    public function users(Request $request): JsonResponse
    {
        $perPage = max(1, min((int) $request->query('per_page', 20), 100));
        $role    = $request->query('role');

        $query = User::query()->orderBy('last_name')->orderBy('first_name');

        if ($role && in_array($role, ['attender', 'teacher', 'admin', 'professor', 'referent'], true)) {
            $query->where('role', $role);
        }

        $paginated = $query->paginate($perPage);

        return response()->json([
            'data' => $paginated->getCollection()->map(fn (User $u) => [
                'id'         => $u->id,
                'name'       => $u->fullName(),
                'email'      => $u->email,
                'role'       => $u->role,
                'created_at' => $u->created_at->toIso8601String(),
            ]),
            'meta' => [
                'total'        => $paginated->total(),
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
            ],
        ]);
    }

    /**
     * GET /api/admin/stats
     *
     * Platform-wide aggregated statistics for the admin audit dashboard.
     *
     * Response:
     * {
     *   "total_users":       int,
     *   "total_professors":  int,
     *   "total_referents":   int,
     *   "total_workshops":   int,
     *   "active_workshops":  int,
     *   "total_enrolled":    int,   — registrations with status = 'enrolled'
     *   "total_attended":    int,   — registrations with attended = true
     * }
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'total_users'      => User::count(),
            'total_professors' => User::whereIn('role', ['attender', 'professor'])->count(),
            'total_referents'  => User::whereIn('role', ['teacher', 'referent'])->count(),
            'total_workshops'  => Workshop::count(),
            'active_workshops' => Workshop::active()->count(),
            'total_enrolled'   => Registration::where('status', 'enrolled')->count(),
            'total_attended'   => Registration::where('attended', true)->count(),
        ]);
    }

    /**
     * DELETE /api/admin/workshops/{workshop}
     *
     * Completely deletes a workshop along with all its registrations
     * and associated certificates.
     */
    public function destroyWorkshop(Workshop $workshop): JsonResponse
    {
        DB::transaction(function () use ($workshop) {
            $registrationIds = $workshop->registrations()->pluck('id');
            
            // Delete all certificates related to these registrations
            if ($registrationIds->isNotEmpty()) {
                Certificate::whereIn('registration_id', $registrationIds)->delete();
            }
            
            // Delete the registrations
            $workshop->registrations()->delete();
            
            // Finally, delete the workshop
            $workshop->delete();
        });

        return response()->json([
            'message' => 'Workshop deleted successfully.',
        ]);
    }

    /**
     * PATCH /api/admin/users/{user}/role
     *
     * Updates the role of a user.
     */
    public function updateRole(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'role' => ['required', 'string', 'in:admin,teacher,attender,referent,professor'],
        ]);

        $newRole = match ($request->input('role')) {
            'referent' => 'teacher',
            'professor' => 'attender',
            default => $request->input('role'),
        };

        $user->update(['role' => $newRole]);

        if ($newRole === 'attender') {
            TeacherInvitation::query()
                ->where('email', $user->email)
                ->delete();
        } elseif ($newRole === 'teacher') {
            TeacherInvitation::updateOrCreate(
                ['email' => $user->email],
                ['role' => 'teacher', 'accepted_at' => now(), 'notice_seen_at' => now()]
            );

            if ($user->email) {
                Mail::to($user->email)->send(new TeacherRoleMail());
            }
        }

        return response()->json([
            'message' => 'User role updated successfully.',
            'user'    => [
                'id'         => $user->id,
                'name'       => $user->fullName(),
                'email'      => $user->email,
                'role'       => $user->role,
                'created_at' => $user->created_at->toIso8601String(),
            ],
        ]);
    }

    public function destroyUser(Request $request, User $user): JsonResponse
    {
        if ($request->user()->id === $user->id) {
            abort(response()->json(['message' => 'You cannot delete your own account.'], 403));
        }

        DB::transaction(function () use ($user) {
            // 1. Delete all workshops created by this user
            // This will automatically cascade delete registrations for these workshops
            Workshop::where('referent_id', $user->id)->delete();

            // 2. Fetch remaining registrations for this user
            $registrations = Registration::where('user_id', $user->id)->get();

            foreach ($registrations as $registration) {
                $lockedWorkshop = Workshop::query()
                    ->whereKey($registration->workshop_id)
                    ->lockForUpdate()
                    ->first();

                if (! $lockedWorkshop) {
                    continue; // Should not happen due to foreign keys, but just in case
                }

                $wasEnrolled = $registration->status === 'enrolled';

                // Delete the registration
                $registration->delete();

                // Waitlist promotion logic
                if ($wasEnrolled) {
                    $promoted = Registration::query()
                        ->where('workshop_id', $lockedWorkshop->id)
                        ->where('status', 'waitlist')
                        ->orderBy('created_at')
                        ->orderBy('id')
                        ->lockForUpdate()
                        ->first();

                    if ($promoted) {
                        $promoted->forceFill(['status' => 'enrolled'])->save();

                        $promoted->loadMissing('user');
                        if ($promoted->user && $promoted->user->email) {
                            Mail::to($promoted->user->email)->send(new WaitlistPromotionMail($lockedWorkshop));
                        }
                    } else {
                        $lockedWorkshop->forceFill([
                            'occupied_slots' => max(0, (int) $lockedWorkshop->occupied_slots - 1),
                        ])->save();
                    }
                }
            }

            // 3. Delete any teacher invitations for this user
            TeacherInvitation::where('email', $user->email)->delete();

            // 4. Finally, delete the user
            $user->delete();
        });

        return response()->json(null, 204);
    }

    public function publicCategories(): JsonResponse
    {
        return response()->json(Category::all());
    }

    public function categories(): JsonResponse
    {
        $categories = Category::withCount('workshops')->get();
        return response()->json($categories);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:50'],
        ]);

        $category = Category::create($validated);

        return response()->json([
            'message' => 'Category created successfully.',
            'category' => $category,
        ], 201);
    }

    public function updateCategory(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:50'],
        ]);

        $category->update($validated);

        return response()->json([
            'message' => 'Category updated successfully.',
            'category' => $category,
        ]);
    }

    public function destroyCategory(Category $category): JsonResponse
    {
        DB::transaction(function () use ($category) {
            // Delete all workshops that belong to this category
            // This will automatically cascade delete registrations and certificates for these workshops
            Workshop::where('category_id', $category->id)->delete();

            // Finally, delete the category itself
            $category->delete();
        });

        return response()->json(null, 204);
    }
}
