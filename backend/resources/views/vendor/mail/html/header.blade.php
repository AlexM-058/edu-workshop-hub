@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
<img src="{{ rtrim(config('app.frontend_url') ?? 'http://localhost:5173', '/') }}/edu-logo.jpeg" class="logo" alt="Edu Logo" style="max-height: 50px; width: auto; max-width: 100%;">
</a>
</td>
</tr>
