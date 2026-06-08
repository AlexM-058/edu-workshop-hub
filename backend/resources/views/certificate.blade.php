<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <title>Certificat de Participare</title>
    <style>
        @page {
            margin: 50px;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif; /* DejaVu supports diacritics well in dompdf */
            color: #333;
            line-height: 1.6;
        }
        .page {
            page-break-after: always;
            position: relative;
            height: 100%;
        }
        .page:last-child {
            page-break-after: avoid;
        }
        .header {
            text-align: left;
            margin-bottom: 50px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            color: #1a202c;
        }
        .header img {
            max-height: 60px;
            margin-top: 10px;
        }
        .content {
            text-align: center;
            margin-top: 100px;
        }
        .title {
            font-size: 32px;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 40px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .text {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .highlight {
            font-size: 22px;
            font-weight: bold;
            color: #2b6cb0;
        }
        .footer {
            position: absolute;
            bottom: 50px;
            width: 100%;
        }
        .date {
            float: left;
            font-size: 16px;
        }
        .signature {
            float: right;
            font-size: 18px;
            font-weight: bold;
            font-style: italic;
            color: #2d3748;
        }
        .clearfix::after {
            content: "";
            clear: both;
            display: table;
        }
    </style>
</head>
<body>

    @php
        $frontendUrl = rtrim(config('app.frontend_url') ?? 'http://localhost:5173', '/');
        $logoUrl = $frontendUrl . '/edu-logo.jpeg';
        
        $participantName = $registration->user?->fullName() ?? 'Participant';
        $workshopTitleRo = $workshop->title_ro ?? $workshop->title['ro'] ?? 'Workshop';
        $workshopTitleDe = $workshop->title_de ?? $workshop->title['de'] ?? 'Workshop';
        $teacherName = $workshop->coordinator_name ?: ($workshop->referent?->name ?? 'Coordonator');
        
        // Format dates
        $dateRo = \Carbon\Carbon::parse($workshop->scheduled_at)->locale('ro')->isoFormat('D MMMM YYYY');
        $dateDe = \Carbon\Carbon::parse($workshop->scheduled_at)->locale('de')->isoFormat('D. MMMM YYYY');
        $todayRo = now()->locale('ro')->isoFormat('D MMMM YYYY');
        $todayDe = now()->locale('de')->isoFormat('D. MMMM YYYY');
    @endphp

    <!-- Pagina în Română -->
    <div class="page">
        <div class="header">
            <h1>EduCraft</h1>
            <img src="{{ $logoUrl }}" alt="EduCraft Logo">
        </div>

        <div class="content">
            <div class="title">Certificat de Participare</div>
            
            <div class="text">Prin prezenta se adeverește că</div>
            <div class="highlight">{{ $participantName }}</div>
            <br>
            <div class="text">a participat cu succes la cursul</div>
            <div class="highlight">{{ $workshopTitleRo }}</div>
            <br>
            <div class="text">
                ținut în data de <strong>{{ $dateRo }}</strong><br>
                sub îndrumarea coordonatorului <strong>{{ $teacherName }}</strong>.
            </div>
            
            <br><br>
            <div class="text" style="font-size: 14px; opacity: 0.8; max-width: 600px; margin: 0 auto;">
                Acest certificat atestă implicarea activă și dedicarea pentru dezvoltarea profesională continuă în cadrul platformei noastre. Vă mulțumim pentru participare!
            </div>
        </div>

        <div class="footer clearfix">
            <div class="date">
                Data eliberării:<br>
                <strong>{{ $todayRo }}</strong>
            </div>
            <div class="signature">
                Echipa Edu
            </div>
        </div>
    </div>

    <!-- Pagina în Germană -->
    <div class="page">
        <div class="header">
            <h1>EduCraft</h1>
            <img src="{{ $logoUrl }}" alt="EduCraft Logo">
        </div>

        <div class="content">
            <div class="title">Teilnahmezertifikat</div>
            
            <div class="text">Hiermit wird bestätigt, dass</div>
            <div class="highlight">{{ $participantName }}</div>
            <br>
            <div class="text">erfolgreich am Kurs</div>
            <div class="highlight">{{ $workshopTitleDe }}</div>
            <div class="text">teilgenommen hat.</div>
            <br>
            <div class="text">
                Der Kurs fand am <strong>{{ $dateDe }}</strong> statt<br>
                unter der Leitung von <strong>{{ $teacherName }}</strong>.
            </div>
            
            <br><br>
            <div class="text" style="font-size: 14px; opacity: 0.8; max-width: 600px; margin: 0 auto;">
                Dieses Zertifikat bescheinigt das aktive Engagement und die Hingabe zur kontinuierlichen beruflichen Weiterbildung auf unserer Plattform. Vielen Dank für Ihre Teilnahme!
            </div>
        </div>

        <div class="footer clearfix">
            <div class="date">
                Ausstellungsdatum:<br>
                <strong>{{ $todayDe }}</strong>
            </div>
            <div class="signature">
                Echipa Edu
            </div>
        </div>
    </div>

</body>
</html>
