<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Workshop;
use Illuminate\Database\Seeder;

class RandomWorkshopsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Preluăm primul referent existent pentru a-i atribui aceste cursuri
        $referent = User::whereIn('role', ['teacher', 'referent'])->first();
        if (!$referent) {
            $this->command->error("Nu a fost găsit niciun referent în baza de date. Vă rugăm rulați DatabaseSeeder mai întâi.");
            return;
        }

        $workshops = [
            [
                'title_ro'       => 'Gamificarea în educație: de la teorie la practică',
                'title_de'       => 'Gamification in der Bildung: von der Theorie zur Praxis',
                'description_ro' => 'Aflați cum să transformați o sală de clasă obișnuită într-un mediu interactiv folosind elemente de game design. Vom explora platforme precum Kahoot, ClassDojo și strategii analogice de recompensă.',
                'description_de' => 'Erfahren Sie, wie Sie ein gewöhnliches Klassenzimmer mit Game-Design-Elementen in eine interaktive Umgebung verwandeln. Wir erkunden Plattformen wie Kahoot und ClassDojo.',
                'location'       => 'Cluj Hub, Sala de Conferințe',
                'max_slots'      => 30,
                'occupied_slots' => rand(5, 25),
                'scheduled_at'   => now()->addDays(rand(5, 30)),
                'duration'       => '4 ore',
                'cost'           => 150.00,
                'coordinator_name'=> 'Alexandru Nistor',
                'coordinator_bio'=> 'Expert în integrarea tehnologiilor emergente în procesul de predare-învățare, cu peste 10 ani de experiență.',
                'is_active'      => true,
            ],
            [
                'title_ro'       => 'Inteligența emoțională a educatorului modern',
                'title_de'       => 'Emotionale Intelligenz des modernen Pädagogen',
                'description_ro' => 'Un atelier profund dedicat dezvoltării socio-emoționale a cadrelor didactice. Gestionarea conflictelor, recunoașterea propriilor triggere emoționale și empatia activă în sala de clasă.',
                'description_de' => 'Ein Workshop, der der sozial-emotionalen Entwicklung von Lehrkräften gewidmet ist. Konfliktmanagement und aktive Empathie im Klassenzimmer.',
                'location'       => 'Online (Google Meet)',
                'max_slots'      => 50,
                'occupied_slots' => rand(20, 50),
                'scheduled_at'   => now()->addDays(rand(10, 40)),
                'duration'       => '3 ore',
                'cost'           => 100.00,
                'coordinator_name'=> 'Ioana Simion',
                'coordinator_bio'=> 'Psiholog clinician și consilier școlar cu o vastă expertiză în formarea cadrelor didactice.',
                'is_active'      => true,
            ],
            [
                'title_ro'       => 'Metoda Montessori aplicată în ciclul primar',
                'title_de'       => 'Montessori-Methode in der Grundschule',
                'description_ro' => 'Cum putem adapta principiile pedagogiei Montessori într-o școală de stat? Vom discuta despre materialele specifice, mediul pregătit și rolul observator al învățătorului.',
                'description_de' => 'Wie können wir die Prinzipien der Montessori-Pädagogik an eine staatliche Schule anpassen? Diskussion über Materialien und vorbereitete Umgebung.',
                'location'       => 'București, Școala nr. 12',
                'max_slots'      => 20,
                'occupied_slots' => rand(0, 15),
                'scheduled_at'   => now()->addDays(rand(1, 20)),
                'duration'       => '6 ore',
                'cost'           => 250.00,
                'coordinator_name'=> 'Maria Popescu',
                'coordinator_bio'=> 'Educator Montessori certificat AMI, fondatoarea unui centru de resurse educaționale.',
                'is_active'      => true,
            ],
            [
                'title_ro'       => 'Incluziunea școlară a copiilor cu CES',
                'title_de'       => 'Schulische Inklusion von Kindern mit sonderpädagogischem Förderbedarf',
                'description_ro' => 'Workshop dedicat metodelor practice prin care putem adapta curriculumul și evaluarea pentru elevii cu Cerințe Educaționale Speciale. Studii de caz reale și planuri de intervenție personalizate.',
                'description_de' => 'Workshop zu praktischen Methoden, mit denen wir Lehrpläne und Bewertungen für Schüler mit sonderpädagogischem Förderbedarf anpassen können.',
                'location'       => 'Timișoara, Biblioteca Județeană',
                'max_slots'      => 25,
                'occupied_slots' => rand(10, 25),
                'scheduled_at'   => now()->addDays(rand(15, 50)),
                'duration'       => '5 ore',
                'cost'           => 0.00, // Gratuit
                'coordinator_name'=> 'Dr. Vasile Botea',
                'coordinator_bio'=> 'Doctor în Științele Educației, specializat pe strategii incluzive și echitate.',
                'is_active'      => true,
            ],
            [
                'title_ro'       => 'Prevenirea abandonului școlar prin învățarea bazată pe proiecte (PBL)',
                'title_de'       => 'Prävention von Schulabbruch durch projektbasiertes Lernen (PBL)',
                'description_ro' => 'Atrageți interesul elevilor din medii defavorizate prin proiecte reale, conectate la comunitate. Descoperiți pașii construirii unui proiect transdisciplinar captivant.',
                'description_de' => 'Wecken Sie das Interesse von Schülern aus benachteiligten Verhältnissen durch echte, gemeinschaftsbezogene Projekte.',
                'location'       => 'Online (Microsoft Teams)',
                'max_slots'      => 100,
                'occupied_slots' => rand(30, 80),
                'scheduled_at'   => now()->addDays(rand(20, 60)),
                'duration'       => '4 ore',
                'cost'           => 80.00,
                'coordinator_name'=> 'Elena Dumitru',
                'coordinator_bio'=> 'Fost director de școală și inițiatoare a multiple programe de mentorat național.',
                'is_active'      => true,
            ]
        ];

        $categories = \App\Models\Category::all();

        foreach ($workshops as $wsData) {
            Workshop::create(array_merge($wsData, [
                'referent_id' => $referent->id,
                'category_id' => $categories->random()->id ?? null,
            ]));
        }

        $this->command->info('✓ Cele 5 workshop-uri random și creative au fost adăugate cu succes!');
    }
}
