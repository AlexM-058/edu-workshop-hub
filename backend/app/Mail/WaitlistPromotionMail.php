<?php

namespace App\Mail;

use App\Models\Workshop;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WaitlistPromotionMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Workshop $workshop
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Loc disponibil / Freier Platz: ' . ($this->workshop->title_ro ?? 'Workshop EduCraft'),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.waitlist-promotion',
        );
    }
}
