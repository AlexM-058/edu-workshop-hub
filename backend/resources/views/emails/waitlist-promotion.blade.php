<x-mail::message>
# Vești bune! Un loc a devenit disponibil.

Te anunțăm cu bucurie că un loc s-a eliberat pentru workshop-ul **{{ $workshop->title_ro ?? 'EduCraft' }}**, iar tu ai fost promovat automat de pe lista de așteptare!
Acum ești înscris oficial și locul tău este asigurat.

@if($workshop->scheduled_at)
**Data și ora:** {{ \Carbon\Carbon::parse($workshop->scheduled_at)->format('d.m.Y H:i') }}
@endif
@if($workshop->location)
**Locația:** {{ $workshop->location }}
@endif

---

# Gute Nachrichten! Ein Platz ist frei geworden.

Wir freuen uns, dir mitteilen zu können, dass ein Platz für den Workshop **{{ $workshop->title_de ?? $workshop->title_ro ?? 'EduCraft' }}** frei geworden ist und du automatisch von der Warteliste aufgerückt bist!
Du bist nun offiziell angemeldet und dein Platz ist gesichert.

@if($workshop->scheduled_at)
**Datum und Uhrzeit:** {{ \Carbon\Carbon::parse($workshop->scheduled_at)->format('d.m.Y H:i') }}
@endif
@if($workshop->location)
**Ort:** {{ $workshop->location }}
@endif

Cu prietenie / Mit freundlichen Grüßen,<br>
Echipa Edu
</x-mail::message>
