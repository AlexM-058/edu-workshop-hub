<x-mail::message>
# Felicitări!

Ai fost înscris cu succes la workshop-ul **{{ $workshop->title_ro ?? 'EduCraft' }}**.
Ne bucurăm să te avem alături și așteptăm cu nerăbdare să participi la această sesiune.

@if($workshop->scheduled_at)
**Data și ora:** {{ \Carbon\Carbon::parse($workshop->scheduled_at)->format('d.m.Y H:i') }}
@endif
@if($workshop->location)
**Locația:** {{ $workshop->location }}
@endif

---

# Herzlichen Glückwunsch!

Du wurdest erfolgreich für den Workshop **{{ $workshop->title_de ?? $workshop->title_ro ?? 'EduCraft' }}** angemeldet.
Wir freuen uns, dich dabei zu haben und erwarten deine Teilnahme an dieser Sitzung mit Spannung.

@if($workshop->scheduled_at)
**Datum und Uhrzeit:** {{ \Carbon\Carbon::parse($workshop->scheduled_at)->format('d.m.Y H:i') }}
@endif
@if($workshop->location)
**Ort:** {{ $workshop->location }}
@endif

<x-mail::button :url="config('app.frontend_url') ?? 'http://localhost:5173'">
Vezi platforma / Zur Plattform
</x-mail::button>

Cu prietenie / Mit freundlichen Grüßen,<br>
Echipa {{ config('app.name') }}
</x-mail::message>
