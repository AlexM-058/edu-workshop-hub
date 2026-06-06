<?php

namespace Tests\Unit;

use App\Http\Middleware\EnsureUserHasRole;
use App\Http\Resources\RegistrationResource;
use App\Http\Resources\WorkshopResource;
use App\Models\Registration;
use App\Models\User;
use App\Models\Workshop;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class ResourcesAndModelsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_full_name_falls_back_to_name_then_email(): void
    {
        $this->assertSame('Ana Pop', User::factory()->make([
            'first_name' => 'Ana',
            'last_name' => 'Pop',
            'name' => 'Legacy Name',
            'email' => 'ana@example.com',
        ])->fullName());

        $this->assertSame('Legacy Name', User::factory()->make([
            'first_name' => '',
            'last_name' => '',
            'name' => 'Legacy Name',
            'email' => 'legacy@example.com',
        ])->fullName());

        $this->assertSame('fallback@example.com', User::factory()->make([
            'first_name' => '',
            'last_name' => '',
            'name' => null,
            'email' => 'fallback@example.com',
        ])->fullName());
    }

    public function test_workshop_slot_helpers_handle_capacity_and_unlimited_capacity(): void
    {
        $open = Workshop::factory()->make(['max_slots' => 10, 'capacity' => 10, 'occupied_slots' => 9]);
        $full = Workshop::factory()->make(['max_slots' => 10, 'capacity' => 10, 'occupied_slots' => 10]);
        $unlimited = Workshop::factory()->make(['max_slots' => null, 'capacity' => null, 'occupied_slots' => 999]);

        $this->assertTrue($open->hasAvailableSlots());
        $this->assertFalse($full->hasAvailableSlots());
        $this->assertTrue($unlimited->hasAvailableSlots());
    }

    public function test_registration_status_and_certificate_helpers(): void
    {
        $registration = Registration::factory()->enrolled()->create(['attended' => false]);

        $this->assertTrue($registration->isEnrolled());
        $this->assertFalse($registration->isOnWaitlist());
        $this->assertFalse($registration->canDownloadCertificate());

        $registration->forceFill(['status' => 'waitlist', 'attended' => true])->save();
        $registration->certificate()->create(['file_path' => 'certificates/test.pdf']);

        $this->assertFalse($registration->isEnrolled());
        $this->assertTrue($registration->isOnWaitlist());
        $this->assertTrue($registration->canDownloadCertificate());
    }

    public function test_workshop_resource_serializes_bilingual_fallbacks_and_slot_state(): void
    {
        $referent = User::factory()->create([
            'first_name' => 'Tina',
            'last_name' => 'Teacher',
            'role' => 'teacher',
        ]);
        $workshop = Workshop::factory()->create([
            'referent_id' => $referent->id,
            'title' => 'Legacy title',
            'title_ro' => null,
            'title_de' => null,
            'description' => 'Legacy description',
            'description_ro' => null,
            'description_de' => null,
            'max_slots' => 12,
            'occupied_slots' => 5,
            'is_active' => false,
            'status' => 'published',
        ])->load('referent');

        $payload = (new WorkshopResource($workshop))->toArray(Request::create('/'));

        $this->assertSame('Legacy title', $payload['title']['ro']);
        $this->assertSame('Legacy description', $payload['description']['de']);
        $this->assertSame(7, $payload['available_slots']);
        $this->assertTrue($payload['is_open']);
        $this->assertTrue($payload['is_active']);
        $this->assertSame('Tina Teacher', $payload['referent']['name']);
    }

    public function test_registration_resource_embeds_workshop_and_certificate_state(): void
    {
        $referent = User::factory()->create(['first_name' => 'Mara', 'last_name' => 'Mentor']);
        $workshop = Workshop::factory()->create(['referent_id' => $referent->id]);
        $registration = Registration::factory()->create([
            'workshop_id' => $workshop->id,
            'attended' => true,
        ]);
        $registration->certificate()->create(['file_path' => 'certificates/test.pdf']);

        $payload = (new RegistrationResource($registration->load(['workshop.referent', 'certificate'])))
            ->toArray(Request::create('/'));

        $this->assertSame($registration->id, $payload['id']);
        $this->assertSame($workshop->id, $payload['workshop']['id']);
        $this->assertSame('Mara Mentor', $payload['workshop']['referent']['name']);
        $this->assertTrue($payload['has_certificate']);
        $this->assertTrue($payload['can_download_certificate']);
    }

    public function test_role_middleware_allows_matching_role_and_rejects_missing_or_wrong_role(): void
    {
        $middleware = new EnsureUserHasRole();
        $teacher = User::factory()->make(['role' => 'teacher']);
        $request = Request::create('/teacher/status');
        $request->setUserResolver(fn () => $teacher);

        $response = $middleware->handle($request, fn () => response('ok'), 'teacher', 'admin');
        $this->assertSame('ok', $response->getContent());

        $request->setUserResolver(fn () => User::factory()->make(['role' => 'attender']));
        $this->assertSame(403, $middleware->handle($request, fn () => response('ok'), 'teacher')->getStatusCode());

        $request->setUserResolver(fn () => null);
        $this->assertSame(403, $middleware->handle($request, fn () => response('ok'), 'teacher')->getStatusCode());
    }
}
