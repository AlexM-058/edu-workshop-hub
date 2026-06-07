<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Certificate;
use App\Models\Registration;
use App\Models\User;
use App\Models\Workshop;
use Illuminate\Database\Seeder;

/**
 * Development seed data — realistic but fictional.
 *
 * Run with: docker compose run --rm backend php artisan db:seed
 * Reset + reseed: docker compose run --rm backend php artisan migrate:fresh --seed
 *
 * DO NOT run this in production.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ------------------------------------------------------------------ //
        // Users
        // ------------------------------------------------------------------ //

        $admin = User::factory()->admin()->create([
            'clerk_id'   => 'user_dev_admin',
            'first_name' => 'Alexandra',
            'last_name'  => 'Mureșan',
            'name'       => 'Alexandra Mureșan',
            'email'      => 'admin@edu-workshop.dev',
        ]);

        $referent1 = User::factory()->referent()->create([
            'clerk_id'   => 'user_dev_referent',
            'first_name' => 'Ionuț',
            'last_name'  => 'Popa',
            'name'       => 'Ionuț Popa',
            'email'      => 'referent@edu-workshop.dev',
        ]);

        $referent2 = User::factory()->referent()->create([
            'clerk_id'   => 'user_dev_referent2',
            'first_name' => 'Maria',
            'last_name'  => 'Stoica',
            'name'       => 'Maria Stoica',
            'email'      => 'referent2@edu-workshop.dev',
        ]);

        $professor1 = User::factory()->create([
            'clerk_id'   => 'user_dev_professor',
            'first_name' => 'Andrei',
            'last_name'  => 'Constantin',
            'name'       => 'Andrei Constantin',
            'email'      => 'professor@edu-workshop.dev',
        ]);

        $professor2 = User::factory()->create([
            'clerk_id'   => 'user_dev_professor2',
            'first_name' => 'Elena',
            'last_name'  => 'Dumitrescu',
            'name'       => 'Elena Dumitrescu',
            'email'      => 'professor2@edu-workshop.dev',
        ]);

        $professor3 = User::factory()->create([
            'clerk_id'   => 'user_dev_professor3',
            'first_name' => 'Mihai',
            'last_name'  => 'Ionescu',
            'name'       => 'Mihai Ionescu',
            'email'      => 'professor3@edu-workshop.dev',
        ]);

        // ------------------------------------------------------------------ //
        // Categories
        // ------------------------------------------------------------------ //
        $catPedagogy = Category::create(['name' => 'Pedagogie', 'icon' => 'school']);
        $catTech = Category::create(['name' => 'Tehnologie', 'icon' => 'computer']);
        $catPsychology = Category::create(['name' => 'Psihologie', 'icon' => 'psychology']);
        $catManagement = Category::create(['name' => 'Management Școlar', 'icon' => 'corporate_fare']);

        // ------------------------------------------------------------------ //
        // Workshops — bilingual, varied dates and fill levels
        // ------------------------------------------------------------------ //

        $workshops = [

            // ---- Referent 1 workshops ---- //

            Workshop::create([
                'referent_id'    => $referent1->id,
                'title_ro'       => 'Strategii pedagogice avansate pentru clasele digitale',
                'title_de'       => 'Fortgeschrittene pädagogische Strategien für digitale Klassen',
                'description_ro' => 'Un workshop intensiv despre intersecția dintre știința cognitivă și tehnologia educațională. Participanții vor învăța cum să susțină învățarea profundă în medii hibride și să adapteze conținutul pentru diverse stiluri de predare.',
                'description_de' => 'Ein intensiver Workshop über die Schnittstelle von Kognitionswissenschaft und Bildungstechnologie. Die Teilnehmer lernen, tiefes Lernen in hybriden Umgebungen zu fördern.',
                'location'       => 'Cluj-Napoca, Sala 101',
                'category_id'    => $catPedagogy->id,
                'max_slots'      => 25,
                'occupied_slots' => 18,
                'scheduled_at'   => now()->addDays(14),
                'is_active'      => true,
            ]),

            Workshop::create([
                'referent_id'    => $referent1->id,
                'title_ro'       => 'Design incluziv al clasei: echitate și acces',
                'title_de'       => 'Inklusives Klassenraumdesign: Gerechtigkeit und Zugang',
                'description_ro' => 'Sesiune dedicată creării unui mediu de învățare accesibil și echitabil pentru toți elevii, indiferent de nevoile lor specifice. Include studii de caz și strategii practice.',
                'description_de' => 'Sitzung zur Schaffung eines zugänglichen und gerechten Lernumfelds für alle Schülerinnen und Schüler, unabhängig von ihren spezifischen Bedürfnissen.',
                'location'       => 'București, Centrul de Formare',
                'category_id'    => $catPedagogy->id,
                'max_slots'      => 20,
                'occupied_slots' => 20,
                'scheduled_at'   => now()->addDays(21),
                'is_active'      => true,
            ]),

            Workshop::create([
                'referent_id'    => $referent1->id,
                'title_ro'       => 'Evaluare formativă și feedback constructiv',
                'title_de'       => 'Formative Bewertung und konstruktives Feedback',
                'description_ro' => 'Metode moderne de evaluare continuă și tehnici de feedback care sprijină progresul elevilor. Workshop practic cu exerciții individuale și de grup.',
                'description_de' => 'Moderne Methoden der kontinuierlichen Bewertung und Feedbacktechniken, die den Fortschritt der Lernenden unterstützen.',
                'location'       => 'Online (Zoom)',
                'category_id'    => $catPsychology->id,
                'max_slots'      => 40,
                'occupied_slots' => 12,
                'scheduled_at'   => now()->addDays(30),
                'is_active'      => true,
            ]),

            Workshop::create([
                'referent_id'    => $referent1->id,
                'title_ro'       => 'Managementul clasei în era post-pandemică',
                'title_de'       => 'Klassenmanagement in der Post-Pandemie-Ära',
                'description_ro' => 'Strategii pentru reconstruirea dinamicii de grup și menținerea unui climat pozitiv de învățare după perturbările cauzate de pandemia COVID-19.',
                'description_de' => 'Strategien zum Wiederaufbau der Gruppendynamik und zur Aufrechterhaltung eines positiven Lernklimas.',
                'location'       => 'Brașov, Casa Corpului Didactic',
                'category_id'    => $catManagement->id,
                'max_slots'      => 30,
                'occupied_slots' => 8,
                'scheduled_at'   => now()->subDays(10), // past — attended
                'is_active'      => false,
            ]),

            // ---- Referent 2 workshops ---- //

            Workshop::create([
                'referent_id'    => $referent2->id,
                'title_ro'       => 'Utilizarea inteligenței artificiale în predare',
                'title_de'       => 'Einsatz von künstlicher Intelligenz im Unterricht',
                'description_ro' => 'Explorați instrumentele AI disponibile pentru educatori: generatoare de conținut, asistenți de evaluare și platforme adaptive. Workshop aplicativ cu demonstrații live.',
                'description_de' => 'Entdecken Sie KI-Tools für Pädagogen: Content-Generatoren, Bewertungsassistenten und adaptive Plattformen.',
                'location'       => 'Iași, Universitatea Alexandru Ioan Cuza',
                'category_id'    => $catTech->id,
                'max_slots'      => 35,
                'occupied_slots' => 22,
                'scheduled_at'   => now()->addDays(7),
                'is_active'      => true,
            ]),

            Workshop::create([
                'referent_id'    => $referent2->id,
                'title_ro'       => 'Comunicarea cu părinții în mediul digital',
                'title_de'       => 'Kommunikation mit Eltern im digitalen Umfeld',
                'description_ro' => 'Bune practici pentru menținerea unei comunicări eficiente și transparente cu familiile elevilor prin platforme digitale moderne.',
                'description_de' => 'Best Practices für eine effektive und transparente Kommunikation mit Schülerfamilien über moderne digitale Plattformen.',
                'location'       => 'Timișoara, Colegiul Național',
                'category_id'    => $catPedagogy->id,
                'max_slots'      => 25,
                'occupied_slots' => 5,
                'scheduled_at'   => now()->addDays(45),
                'is_active'      => true,
            ]),

            Workshop::create([
                'referent_id'    => $referent2->id,
                'title_ro'       => 'Proiect de lecție centrat pe competențe',
                'title_de'       => 'Kompetenzorientierte Unterrichtsplanung',
                'description_ro' => 'Atelier practic de proiectare a unităților de învățare conform cadrului european al competențelor cheie. Participanții produc un plan de lecție complet.',
                'description_de' => 'Praktischer Workshop zur Planung von Lerneinheiten gemäß dem europäischen Rahmen der Schlüsselkompetenzen.',
                'location'       => 'Sibiu, Centrul Pedagogic',
                'category_id'    => $catPedagogy->id,
                'max_slots'      => 20,
                'occupied_slots' => 20,
                'scheduled_at'   => now()->subDays(30), // past
                'is_active'      => false,
            ]),
        ];

        [$ws1, $ws2, $ws3, $ws4Past, $ws5, $ws6, $ws7Past] = $workshops;

        // ------------------------------------------------------------------ //
        // Registrations — professor1 has a rich history
        // ------------------------------------------------------------------ //

        // Professor 1: enrolled in upcoming, attended a past one
        $reg1 = Registration::create(['workshop_id' => $ws1->id, 'user_id' => $professor1->id, 'status' => 'enrolled',  'attended' => false]);
        $reg2 = Registration::create(['workshop_id' => $ws5->id, 'user_id' => $professor1->id, 'status' => 'enrolled',  'attended' => false]);
        $reg3 = Registration::create(['workshop_id' => $ws2->id, 'user_id' => $professor1->id, 'status' => 'waitlist',  'attended' => false]);
        $reg4 = Registration::create(['workshop_id' => $ws4Past->id, 'user_id' => $professor1->id, 'status' => 'enrolled', 'attended' => true]);
        $reg5 = Registration::create(['workshop_id' => $ws7Past->id, 'user_id' => $professor1->id, 'status' => 'enrolled', 'attended' => true]);

        // Professor 2: enrolled in a couple
        Registration::create(['workshop_id' => $ws1->id, 'user_id' => $professor2->id, 'status' => 'enrolled',  'attended' => false]);
        Registration::create(['workshop_id' => $ws3->id, 'user_id' => $professor2->id, 'status' => 'enrolled',  'attended' => false]);
        Registration::create(['workshop_id' => $ws7Past->id, 'user_id' => $professor2->id, 'status' => 'enrolled', 'attended' => true]);

        // Professor 3: one enrollment, one cancelled
        Registration::create(['workshop_id' => $ws6->id, 'user_id' => $professor3->id, 'status' => 'enrolled',  'attended' => false]);
        Registration::create(['workshop_id' => $ws3->id, 'user_id' => $professor3->id, 'status' => 'cancelled', 'attended' => false]);

        // ------------------------------------------------------------------ //
        // Certificates — only for attended registrations
        // ------------------------------------------------------------------ //

        Certificate::create(['registration_id' => $reg4->id, 'file_path' => 'certificates/2026/cert-managementul-clasei-andrei.pdf']);
        Certificate::create(['registration_id' => $reg5->id, 'file_path' => 'certificates/2026/cert-proiect-lectie-andrei.pdf']);

        $this->command->info('✓ Demo seed complete:');
        $this->command->info("  Users:         3 professors, 2 referents, 1 admin");
        $this->command->info("  Workshops:     5 active (upcoming), 2 inactive (past)");
        $this->command->info("  Registrations: 10 total (enrolled, waitlist, cancelled)");
        $this->command->info("  Certificates:  2 (professor1 — workshops finalizate)");
        $this->command->info('');
        $this->command->info('  Login as professor: professor@edu-workshop.dev');
        $this->command->info('  Login as referent:  referent@edu-workshop.dev');
        $this->command->info('  Login as admin:     admin@edu-workshop.dev');
    }
}
