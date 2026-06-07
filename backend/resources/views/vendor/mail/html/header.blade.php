@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
<img src="{{ isset($message) ? $message->embed(public_path('images/edu-logo.jpeg')) : asset('images/edu-logo.jpeg') }}" class="logo" alt="Edu Logo" style="max-height: 50px; width: auto; max-width: 100%;">
</a>
</td>
</tr>
