<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Registration;
use App\Models\Workshop;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherWorkshopsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.clerk.allow_test_tokens' => true]);
    }

    // -------------------------------------------------------------------------
    // Token helper — same format as ClerkAuthTest
    // -------------------------------------------------------------------------

    private function tokenFor(User $user): string
    {
        return 'test:' . base64_encode(json_encode([
            'sub'   => $user->clerk_id,
            'email' => $user->email,
            'name'  => $user->name,
            'iss'   => config('services.clerk.issuer'),
            'exp'   => time() + 3600,
            'nbf'   => time() - 60,
        ], JSON_THROW_ON_ERROR));
    }

    private function makeReferent(): User
    {
        return User::factory()->create(['role' => 'referent']);
    }

    private function makeWorkshop(User $referent, array $overrides = []): Workshop
    {
        return Workshop::factory()->create(array_merge([
            'referent_id'    => $referent->id,
            'is_active'      => true,
            'scheduled_at'   => now()->addDays(7),
            'occupied_slots' => 5,
            'max_slots'      => 20,
        ], $overrides));
    }

    private function makeAttendanceExportWorkshop(User $referent): Workshop
    {
        $workshop = $this->makeWorkshop($referent, [
            'title_ro' => 'Atelier pedagogic',
            'title_de' => 'Pädagogik-Workshop',
            'location' => 'Cluj',
            'scheduled_at' => '2026-07-15 10:00:00',
        ]);

        $attender = User::factory()->create([
            'role' => 'attender',
            'first_name' => 'Mara',
            'last_name' => 'Ionescu',
            'email' => 'mara@example.com',
        ]);

        $registration = Registration::create([
            'workshop_id' => $workshop->id,
            'user_id' => $attender->id,
            'status' => 'enrolled',
            'attended' => true,
        ]);

        $registration->certificate()->create([
            'file_path' => 'certificates/registration-'.$registration->id.'.pdf',
        ]);

        $absent = User::factory()->create([
            'role' => 'attender',
            'first_name' => 'Luca',
            'last_name' => 'Pop',
            'email' => 'luca@example.com',
        ]);
        Registration::create([
            'workshop_id' => $workshop->id,
            'user_id' => $absent->id,
            'status' => 'enrolled',
            'attended' => false,
        ]);

        $waitlisted = User::factory()->create([
            'role' => 'attender',
            'first_name' => 'Tina',
            'last_name' => 'Schmidt',
            'email' => 'tina@example.com',
        ]);
        Registration::create([
            'workshop_id' => $workshop->id,
            'user_id' => $waitlisted->id,
            'status' => 'waitlist',
            'attended' => false,
        ]);

        $cancelled = User::factory()->create([
            'role' => 'attender',
            'first_name' => 'Ana',
            'last_name' => 'Klein',
            'email' => 'ana@example.com',
        ]);
        Registration::create([
            'workshop_id' => $workshop->id,
            'user_id' => $cancelled->id,
            'status' => 'cancelled',
            'attended' => false,
        ]);

        return $workshop;
    }

    private function makeDiacriticAttendanceExportWorkshop(User $referent): Workshop
    {
        $workshop = $this->makeWorkshop($referent, [
            'title_ro' => 'Învățare colaborativă',
            'title_de' => 'Kollaboratives Lernen',
            'location' => 'Timișoara / München',
            'scheduled_at' => '2026-07-15 10:00:00',
        ]);

        foreach ([
            ['Ștefan', 'Țară', 'stefan.tara@example.com', true],
            ['Müller', 'Groß', 'mueller.gross@example.com', false],
        ] as [$firstName, $lastName, $email, $attended]) {
            $registration = Registration::create([
                'workshop_id' => $workshop->id,
                'user_id' => User::factory()->create([
                    'role' => 'attender',
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $email,
                ])->id,
                'status' => 'enrolled',
                'attended' => $attended,
            ]);

            if ($attended) {
                $registration->certificate()->create([
                    'file_path' => 'certificates/registration-'.$registration->id.'.pdf',
                ]);
            }
        }

        return $workshop;
    }

    /**
     * @return array<int, array<int, string|null>>
     */
    private function parseCsvResponse(string $content): array
    {
        $content = preg_replace('/^\xEF\xBB\xBF/', '', $content) ?? $content;
        $handle = fopen('php://temp', 'r+');
        fwrite($handle, $content);
        rewind($handle);

        $rows = [];
        while (($row = fgetcsv($handle)) !== false) {
            $rows[] = $row;
        }

        fclose($handle);

        return $rows;
    }

    private function assertCsvRowsHaveHeaderWidth(array $rows): void
    {
        $this->assertNotEmpty($rows);
        $width = count($rows[0]);

        foreach ($rows as $row) {
            $this->assertCount($width, $row);
        }
    }

    // -------------------------------------------------------------------------
    // GET /api/teacher/workshops
    // -------------------------------------------------------------------------

    public function test_index_requires_authentication(): void
    {
        $this->getJson('/api/teacher/workshops')->assertUnauthorized();
    }

    public function test_professor_cannot_access_teacher_workshops(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);

        $this->withToken($this->tokenFor($professor))
            ->getJson('/api/teacher/workshops')
            ->assertForbidden();
    }

    public function test_referent_sees_only_own_workshops(): void
    {
        $referent = $this->makeReferent();
        $other    = $this->makeReferent();

        $this->makeWorkshop($referent);
        $this->makeWorkshop($referent);
        $this->makeWorkshop($other); // must NOT appear

        $response = $this->withToken($this->tokenFor($referent))
            ->getJson('/api/teacher/workshops');

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonStructure([
                'data' => [[
                    'id', 'title', 'location',
                    'max_slots', 'occupied_slots', 'is_active', 'scheduled_at',
                ]],
                'meta',
            ]);
    }

    public function test_referent_sees_both_active_and_inactive_own_workshops(): void
    {
        $referent = $this->makeReferent();
        $this->makeWorkshop($referent, ['is_active' => true]);
        $this->makeWorkshop($referent, ['is_active' => false]);

        $response = $this->withToken($this->tokenFor($referent))
            ->getJson('/api/teacher/workshops');

        $response->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_referent_search_sees_only_matching_own_workshops(): void
    {
        $referent = $this->makeReferent();
        $other    = $this->makeReferent();
        $match = $this->makeWorkshop($referent, ['title_ro' => 'Atelier de robotică']);
        $this->makeWorkshop($referent, ['title_ro' => 'Managementul clasei']);
        $this->makeWorkshop($other, ['title_ro' => 'Atelier de robotică avansată']);

        $response = $this->withToken($this->tokenFor($referent))
            ->getJson('/api/teacher/workshops?search=robotică');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $match->id);
    }

    public function test_admin_can_access_teacher_workshops_endpoint(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->makeWorkshop($admin);

        $response = $this->withToken($this->tokenFor($admin))
            ->getJson('/api/teacher/workshops');

        $response->assertOk()->assertJsonCount(1, 'data');
    }

    // -------------------------------------------------------------------------
    // GET /api/teacher/stats
    // -------------------------------------------------------------------------

    public function test_stats_requires_authentication(): void
    {
        $this->getJson('/api/teacher/stats')->assertUnauthorized();
    }

    public function test_stats_professor_is_forbidden(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);

        $this->withToken($this->tokenFor($professor))
            ->getJson('/api/teacher/stats')
            ->assertForbidden();
    }

    public function test_stats_returns_correct_aggregates(): void
    {
        $referent = $this->makeReferent();
        $other    = $this->makeReferent();

        $this->makeWorkshop($referent, ['is_active' => true,  'occupied_slots' => 10, 'max_slots' => 20]);
        $this->makeWorkshop($referent, ['is_active' => true,  'occupied_slots' => 5,  'max_slots' => 15]);
        $this->makeWorkshop($referent, ['is_active' => false, 'occupied_slots' => 3,  'max_slots' => 10]);
        $this->makeWorkshop($other,    ['is_active' => true,  'occupied_slots' => 8,  'max_slots' => 25]); // excluded

        $response = $this->withToken($this->tokenFor($referent))
            ->getJson('/api/teacher/stats');

        $response->assertOk()
            ->assertExactJson([
                'total_workshops'  => 3,
                'active_workshops' => 2,
                'total_enrolled'   => 18, // 10 + 5 + 3
                'total_capacity'   => 45, // 20 + 15 + 10
            ]);
    }

    public function test_stats_returns_zeros_when_no_workshops(): void
    {
        $referent = $this->makeReferent();

        $this->withToken($this->tokenFor($referent))
            ->getJson('/api/teacher/stats')
            ->assertOk()
            ->assertExactJson([
                'total_workshops'  => 0,
                'active_workshops' => 0,
                'total_enrolled'   => 0,
                'total_capacity'   => 0,
            ]);
    }

    public function test_teacher_can_list_participants_for_own_workshop(): void
    {
        $referent = $this->makeReferent();
        $workshop = $this->makeWorkshop($referent);
        $attender = User::factory()->create(['role' => 'attender']);
        Registration::create([
            'workshop_id' => $workshop->id,
            'user_id' => $attender->id,
            'status' => 'enrolled',
            'attended' => false,
        ]);

        $this->withToken($this->tokenFor($referent))
            ->getJson("/api/teacher/workshops/{$workshop->id}/participants")
            ->assertOk()
            ->assertJsonPath('data.0.user.email', $attender->email)
            ->assertJsonPath('data.0.status', 'enrolled')
            ->assertJsonPath('data.0.attended', false);
    }

    public function test_teacher_can_mark_attendance_and_create_certificate(): void
    {
        $referent = $this->makeReferent();
        $workshop = $this->makeWorkshop($referent);
        $attender = User::factory()->create(['role' => 'attender']);
        $registration = Registration::create([
            'workshop_id' => $workshop->id,
            'user_id' => $attender->id,
            'status' => 'enrolled',
            'attended' => false,
        ]);

        $this->withToken($this->tokenFor($referent))
            ->patchJson("/api/teacher/registrations/{$registration->id}/attendance", [
                'attended' => true,
            ])
            ->assertOk()
            ->assertJsonPath('registration.attended', true)
            ->assertJsonPath('registration.can_download_certificate', true);

        $this->assertDatabaseHas('registrations', [
            'id' => $registration->id,
            'attended' => true,
        ]);
        $this->assertDatabaseHas('certificates', [
            'registration_id' => $registration->id,
        ]);
    }

    public function test_teacher_can_export_attendance_csv_in_romanian(): void
    {
        $referent = $this->makeReferent();
        $workshop = $this->makeAttendanceExportWorkshop($referent);

        $response = $this->withToken($this->tokenFor($referent))
            ->get("/api/teacher/workshops/{$workshop->id}/attendance-list?format=csv&locale=ro")
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8')
            ->assertSee('Titlu workshop')
            ->assertSee('Data workshop')
            ->assertSee('Locație')
            ->assertSee('Status înscriere')
            ->assertSee('Prezență')
            ->assertSee('Certificat disponibil')
            ->assertSee('mara@example.com')
            ->assertSee('Confirmat')
            ->assertSee('Prezent')
            ->assertSee('Neprezent')
            ->assertSee('Listă de așteptare')
            ->assertSee('Anulat')
            ->assertSee('Da')
            ->assertSee('Nu');

        $content = $response->getContent();
        $this->assertStringNotContainsString('BROKEN_ATTENDANCE_EXPORT', $content);

        $rows = $this->parseCsvResponse($content);
        $this->assertCount(5, $rows);
        $this->assertSame([
            'Titlu workshop',
            'Data workshop',
            'Locație',
            'Nume participant',
            'Email participant',
            'Status înscriere',
            'Prezență',
            'Certificat disponibil',
        ], $rows[0]);
        $this->assertCsvRowsHaveHeaderWidth($rows);
    }

    public function test_teacher_can_export_attendance_csv_in_german(): void
    {
        $referent = $this->makeReferent();
        $workshop = $this->makeAttendanceExportWorkshop($referent);

        $response = $this->withToken($this->tokenFor($referent))
            ->get("/api/teacher/workshops/{$workshop->id}/attendance-list?format=csv&locale=de")
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8')
            ->assertSee('Workshop-Titel')
            ->assertSee('Workshop-Datum')
            ->assertSee('Ort')
            ->assertSee('Teilnehmername')
            ->assertSee('Teilnehmer-E-Mail')
            ->assertSee('Anmeldestatus')
            ->assertSee('Anwesenheit')
            ->assertSee('Zertifikat verfügbar')
            ->assertSee('mara@example.com')
            ->assertSee('Bestätigt')
            ->assertSee('Anwesend')
            ->assertSee('Nicht anwesend')
            ->assertSee('Warteliste')
            ->assertSee('Storniert')
            ->assertSee('Ja')
            ->assertSee('Nein');

        $content = $response->getContent();
        $this->assertStringNotContainsString('BROKEN_ATTENDANCE_EXPORT', $content);

        $rows = $this->parseCsvResponse($content);
        $this->assertCount(5, $rows);
        $this->assertSame([
            'Workshop-Titel',
            'Workshop-Datum',
            'Ort',
            'Teilnehmername',
            'Teilnehmer-E-Mail',
            'Anmeldestatus',
            'Anwesenheit',
            'Zertifikat verfügbar',
        ], $rows[0]);
        $this->assertCsvRowsHaveHeaderWidth($rows);
    }

    public function test_attendance_csv_locale_falls_back_to_romanian_when_missing_or_invalid(): void
    {
        $referent = $this->makeReferent();
        $workshop = $this->makeAttendanceExportWorkshop($referent);

        $this->withToken($this->tokenFor($referent))
            ->get("/api/teacher/workshops/{$workshop->id}/attendance-list?format=csv")
            ->assertOk()
            ->assertDontSee('BROKEN_ATTENDANCE_EXPORT')
            ->assertSee('Titlu workshop')
            ->assertSee('Confirmat');

        $this->withToken($this->tokenFor($referent))
            ->get("/api/teacher/workshops/{$workshop->id}/attendance-list?format=csv&locale=en")
            ->assertOk()
            ->assertDontSee('BROKEN_ATTENDANCE_EXPORT')
            ->assertSee('Titlu workshop')
            ->assertSee('Confirmat');
    }

    public function test_teacher_can_export_attendance_pdf_in_supported_locales(): void
    {
        $referent = $this->makeReferent();
        $workshop = $this->makeAttendanceExportWorkshop($referent);

        $romanian = $this->withToken($this->tokenFor($referent))
            ->get("/api/teacher/workshops/{$workshop->id}/attendance-list?format=pdf&locale=ro")
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');

        $this->assertStringStartsWith('%PDF-', $romanian->getContent());
        $this->assertNotEmpty($romanian->getContent());
        $this->assertStringNotContainsString('BROKEN_ATTENDANCE_EXPORT', $romanian->getContent());
        $this->assertStringContainsString('/FontFile2', $romanian->getContent());
        $this->assertStringNotContainsString('/BaseFont /Helvetica', $romanian->getContent());

        $german = $this->withToken($this->tokenFor($referent))
            ->get("/api/teacher/workshops/{$workshop->id}/attendance-list?format=pdf&locale=de")
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');

        $this->assertStringStartsWith('%PDF-', $german->getContent());
        $this->assertNotEmpty($german->getContent());
        $this->assertStringNotContainsString('BROKEN_ATTENDANCE_EXPORT', $german->getContent());
        $this->assertStringContainsString('/FontFile2', $german->getContent());
        $this->assertStringNotContainsString('/BaseFont /Helvetica', $german->getContent());
    }

    public function test_teacher_can_export_attendance_pdf_with_unicode_font_for_diacritics(): void
    {
        $referent = $this->makeReferent();
        $workshop = $this->makeDiacriticAttendanceExportWorkshop($referent);

        $response = $this->withToken($this->tokenFor($referent))
            ->get("/api/teacher/workshops/{$workshop->id}/attendance-list?format=pdf&locale=ro")
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');

        $content = $response->getContent();
        $this->assertStringStartsWith('%PDF-', $content);
        $this->assertStringContainsString('/FontFile2', $content);
        $this->assertStringNotContainsString('/BaseFont /Helvetica', $content);
    }
}
