<?php

namespace App\Http\Controllers\Workshops;

use App\Http\Controllers\Controller;
use App\Http\Resources\WorkshopResource;
use App\Models\Registration;
use App\Models\Workshop;
use Barryvdh\DomPDF\Facade\Pdf;
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
     *   - search   (string, optional)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = max(1, min((int) $request->query('per_page', 12), 50));

        $workshops = Workshop::query()
            ->where('referent_id', $request->user()->id)
            ->search($request->query('search'))
            ->with(['referent', 'category'])
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
        $locale = $this->exportLocale($request);

        $workshop->load(['referent', 'category', 'registrations.user', 'registrations.certificate']);

        if ($format === 'pdf') {
            return response($this->attendancePdf($workshop, $locale), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="attendance-'.$workshop->id.'.pdf"',
            ]);
        }

        return response($this->attendanceCsv($workshop, $locale), 200, [
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

    private function attendanceCsv(Workshop $workshop, string $locale): string
    {
        $labels = $this->exportLabels($locale);
        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, $labels['csvHeaders']);

        foreach ($this->exportRows($workshop, $locale, $labels) as $row) {
            fputcsv($handle, array_values($row));
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return "\xEF\xBB\xBF".$csv;
    }

    private function attendancePdf(Workshop $workshop, string $locale): string
    {
        $labels = $this->exportLabels($locale);
        $title = $this->workshopTitle($workshop, $locale);
        $confirmed = $workshop->registrations->where('status', 'enrolled');
        $present = $confirmed->where('attended', true)->count();
        $absent = $confirmed->where('attended', false)->count();
        $waitlisted = $workshop->registrations
            ->filter(fn (Registration $registration): bool => in_array($registration->status, ['waitlist', 'waitlisted'], true))
            ->count();

        return Pdf::loadView('exports.attendance-list', [
            'labels' => $labels['pdf'],
            'tableHeaders' => $labels['pdfTableHeaders'],
            'locale' => $locale,
            'title' => $title,
            'workshopDate' => optional($workshop->scheduled_at)->format('Y-m-d H:i') ?? '-',
            'location' => $workshop->location ?? '-',
            'teacher' => $workshop->referent?->fullName() ?? '-',
            'generatedAt' => now()->format('Y-m-d H:i'),
            'summary' => [
                $labels['pdf']['confirmedTotal'] => $confirmed->count(),
                $labels['pdf']['present'] => $present,
                $labels['pdf']['absent'] => $absent,
                $labels['pdf']['waitlist'] => $waitlisted,
            ],
            'rows' => $this->attendancePdfRows($workshop, $labels),
        ])->setPaper('a4', 'landscape')->output();
    }

    /**
     * @return array<int, array<string, string|null>>
     */
    private function exportRows(Workshop $workshop, string $locale, array $labels): array
    {
        return $workshop->registrations
            ->map(fn (Registration $registration): array => [
                'workshop_title' => $this->workshopTitle($workshop, $locale),
                'workshop_date' => optional($workshop->scheduled_at)->format('Y-m-d H:i'),
                'location' => $workshop->location,
                'participant_name' => $registration->user?->fullName(),
                'participant_email' => $registration->user?->email,
                'registration_status' => $labels['statuses'][$registration->status] ?? $registration->status,
                'attendance' => $registration->attended ? $labels['attendance']['present'] : $labels['attendance']['absent'],
                'certificate_available' => $registration->certificate ? $labels['yes'] : $labels['no'],
            ])
            ->all();
    }

    /**
     * @return array<int, array<string, string|null>>
     */
    private function attendancePdfRows(Workshop $workshop, array $labels): array
    {
        return $workshop->registrations
            ->sortBy([
                fn (Registration $a, Registration $b): int => $this->statusSortWeight($a->status) <=> $this->statusSortWeight($b->status),
                fn (Registration $a, Registration $b): int => $a->created_at <=> $b->created_at,
            ])
            ->values()
            ->map(fn (Registration $registration, int $index): array => [
                'position' => (string) ($index + 1),
                'status' => $labels['statuses'][$registration->status] ?? $registration->status,
                'attendance' => $registration->attended ? $labels['attendance']['present'] : $labels['attendance']['absent'],
                'participant_name' => $registration->user?->fullName() ?? '-',
                'participant_email' => $registration->user?->email ?? '-',
                'registered_at' => optional($registration->created_at)->format('Y-m-d H:i') ?? '-',
                'attendance_confirmed_at' => $registration->attended === null
                    ? '-'
                    : (optional($registration->updated_at)->format('Y-m-d H:i') ?? '-'),
                'certificate_available' => $registration->certificate ? $labels['yes'] : $labels['no'],
            ])
            ->all();
    }

    private function statusSortWeight(string $status): int
    {
        return match ($status) {
            'enrolled' => 0,
            'waitlist', 'waitlisted' => 1,
            default => 2,
        };
    }

    private function exportLocale(Request $request): string
    {
        $locale = $request->query('locale', 'ro');

        return in_array($locale, ['ro', 'de'], true) ? $locale : 'ro';
    }

    /**
     * @return array<string, mixed>
     */
    private function exportLabels(string $locale): array
    {
        $labels = [
            'ro' => [
                'csvHeaders' => [
                    'Titlu workshop',
                    'Data workshop',
                    'Locație',
                    'Nume participant',
                    'Email participant',
                    'Status înscriere',
                    'Prezență',
                    'Certificat disponibil',
                ],
                'statuses' => [
                    'enrolled' => 'Confirmat',
                    'waitlist' => 'Listă de așteptare',
                    'waitlisted' => 'Listă de așteptare',
                    'cancelled' => 'Anulat',
                ],
                'attendance' => [
                    'present' => 'Prezent',
                    'absent' => 'Neprezent',
                ],
                'yes' => 'Da',
                'no' => 'Nu',
                'pdf' => [
                    'title' => 'Lista de prezență',
                    'metadata' => 'Detalii workshop',
                    'summary' => 'Rezumat',
                    'workshop' => 'Workshop',
                    'date' => 'Data',
                    'location' => 'Locație',
                    'teacher' => 'Teacher',
                    'generatedAt' => 'Generat la',
                    'confirmedTotal' => 'Total confirmați',
                    'present' => 'Prezenți',
                    'absent' => 'Neprezenți',
                    'waitlist' => 'Listă de așteptare',
                    'participants' => 'Participanți',
                ],
                'pdfTableHeaders' => [
                    'Nr.',
                    'Status',
                    'Prezență',
                    'Nume',
                    'Email',
                    'Data înscrierii',
                    'Data confirmării',
                    'Certificat',
                ],
            ],
            'de' => [
                'csvHeaders' => [
                    'Workshop-Titel',
                    'Workshop-Datum',
                    'Ort',
                    'Teilnehmername',
                    'Teilnehmer-E-Mail',
                    'Anmeldestatus',
                    'Anwesenheit',
                    'Zertifikat verfügbar',
                ],
                'statuses' => [
                    'enrolled' => 'Bestätigt',
                    'waitlist' => 'Warteliste',
                    'waitlisted' => 'Warteliste',
                    'cancelled' => 'Storniert',
                ],
                'attendance' => [
                    'present' => 'Anwesend',
                    'absent' => 'Nicht anwesend',
                ],
                'yes' => 'Ja',
                'no' => 'Nein',
                'pdf' => [
                    'title' => 'Anwesenheitsliste',
                    'metadata' => 'Workshop-Details',
                    'summary' => 'Zusammenfassung',
                    'workshop' => 'Workshop',
                    'date' => 'Datum',
                    'location' => 'Ort',
                    'teacher' => 'Teacher',
                    'generatedAt' => 'Erstellt am',
                    'confirmedTotal' => 'Bestätigte Teilnehmer',
                    'present' => 'Anwesend',
                    'absent' => 'Nicht anwesend',
                    'waitlist' => 'Warteliste',
                    'participants' => 'Teilnehmer',
                ],
                'pdfTableHeaders' => [
                    'Nr.',
                    'Status',
                    'Anwesenheit',
                    'Name',
                    'E-Mail',
                    'Anmeldedatum',
                    'Bestätigungsdatum',
                    'Zertifikat',
                ],
            ],
        ];

        return $labels[$locale] ?? $labels['ro'];
    }

    private function workshopTitle(Workshop $workshop, string $locale): string
    {
        if ($locale === 'de' && $workshop->title_de) {
            return $workshop->title_de;
        }

        return $workshop->title_ro ?? $workshop->title_de ?? 'Workshop';
    }
}
