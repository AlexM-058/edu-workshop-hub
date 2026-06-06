<?php

namespace App\Http\Controllers\Workshops;

use App\Http\Controllers\Controller;
use App\Http\Resources\WorkshopResource;
use App\Models\Registration;
use App\Models\Workshop;
use App\Support\SimplePdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class TeacherWorkshopController extends Controller
{
    /**
     * GET /api/teacher/workshops
     *
     * Returns a paginated list of workshops owned by the authenticated referent,
     * ordered by most recently created first.
     *
     * Query params:
     *   - per_page (int, default 12, max 50)
     *   - page     (int, default 1)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = max(1, min((int) $request->query('per_page', 12), 50));

        $workshops = Workshop::query()
            ->where('referent_id', $request->user()->id)
            ->with('referent')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return WorkshopResource::collection($workshops);
    }

    /**
     * GET /api/teacher/stats
     *
     * Returns aggregated statistics for the authenticated referent's workshops.
     *
     * Response shape:
     * {
     *   "total_workshops":  int,
     *   "active_workshops": int,
     *   "total_enrolled":   int,
     *   "total_capacity":   int,
     * }
     */
    public function stats(Request $request): JsonResponse
    {
        $base = Workshop::query()
            ->where('referent_id', $request->user()->id);

        $total   = (clone $base)->count();
        $active  = (clone $base)->where('is_active', true)->count();
        $enrolled = (clone $base)->sum('occupied_slots');
        $capacity = (clone $base)->sum('max_slots');

        return response()->json([
            'total_workshops'  => $total,
            'active_workshops' => $active,
            'total_enrolled'   => (int) $enrolled,
            'total_capacity'   => (int) $capacity,
        ]);
    }

    public function participants(Request $request, Workshop $workshop): JsonResponse
    {
        $this->authorizeWorkshopAccess($request, $workshop);

        $registrations = $workshop->registrations()
            ->with(['user', 'certificate'])
            ->orderByRaw("CASE status WHEN 'enrolled' THEN 0 WHEN 'waitlist' THEN 1 ELSE 2 END")
            ->orderBy('created_at')
            ->get()
            ->map(fn (Registration $registration): array => $this->registrationPayload($registration));

        return response()->json(['data' => $registrations]);
    }

    public function markAttendance(Request $request, Registration $registration): JsonResponse
    {
        $data = $request->validate([
            'attended' => ['required', 'boolean'],
        ]);

        $registration->loadMissing('workshop');
        $this->authorizeWorkshopAccess($request, $registration->workshop);

        abort_if($registration->status !== 'enrolled', 422, 'Only enrolled participants can have attendance marked.');

        $registration->forceFill(['attended' => $data['attended']])->save();

        if ($registration->attended) {
            $registration->certificate()->firstOrCreate([], [
                'file_path' => 'certificates/registration-'.$registration->id.'.pdf',
            ]);
        } else {
            $registration->certificate()->delete();
        }

        return response()->json([
            'registration' => $this->registrationPayload($registration->refresh()->load(['user', 'certificate'])),
        ]);
    }

    public function attendanceList(Request $request, Workshop $workshop): Response
    {
        $this->authorizeWorkshopAccess($request, $workshop);

        $format = $request->query('format', 'csv');
        abort_unless(in_array($format, ['csv', 'pdf'], true), 422, 'Unsupported export format.');

        $workshop->load(['registrations.user']);

        if ($format === 'pdf') {
            return response($this->attendancePdf($workshop), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="attendance-'.$workshop->id.'.pdf"',
            ]);
        }

        return response($this->attendanceCsv($workshop), 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="attendance-'.$workshop->id.'.csv"',
        ]);
    }

    private function authorizeWorkshopAccess(Request $request, Workshop $workshop): void
    {
        $user = $request->user();

        abort_unless(
            $user->role === 'admin'
                || $workshop->referent_id === $user->id
                || $workshop->teacher_id === $user->id,
            404
        );
    }

    private function registrationPayload(Registration $registration): array
    {
        $registration->loadMissing(['user', 'certificate']);

        return [
            'id' => $registration->id,
            'workshop_id' => $registration->workshop_id,
            'user_id' => $registration->user_id,
            'status' => $registration->status,
            'attended' => $registration->attended,
            'can_download_certificate' => $registration->canDownloadCertificate(),
            'user' => [
                'id' => $registration->user->id,
                'name' => $registration->user->fullName(),
                'email' => $registration->user->email,
            ],
        ];
    }

    private function attendanceCsv(Workshop $workshop): string
    {
        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, ['Name', 'Email', 'Status', 'Attendance']);

        foreach ($workshop->registrations as $registration) {
            fputcsv($handle, [
                $registration->user?->fullName(),
                $registration->user?->email,
                $registration->status,
                $registration->attended ? 'attended' : 'absent',
            ]);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return $csv;
    }

    private function attendancePdf(Workshop $workshop): string
    {
        $title = $workshop->title_ro ?? $workshop->title ?? 'Workshop';
        $lines = ['Attendance List', 'Workshop: '.$title];

        foreach ($workshop->registrations as $registration) {
            $lines[] = ($registration->user?->fullName() ?? '-')
                .' | '.($registration->user?->email ?? '-')
                .' | '.$registration->status
                .' | '.($registration->attended ? 'attended' : 'absent');
        }

        return SimplePdf::fromLines($lines);
    }
}
