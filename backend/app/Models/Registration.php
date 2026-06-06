<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * A professor's registration to a workshop.
 *
 * @property int    $id
 * @property int    $workshop_id
 * @property int    $user_id
 * @property string $status   — 'enrolled' | 'waitlist' | 'cancelled'
 * @property bool   $attended
 */
class Registration extends Model
{
    use HasFactory;

    protected $fillable = ['workshop_id', 'user_id', 'status', 'attended'];

    protected $casts = ['attended' => 'boolean'];

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    public function workshop(): BelongsTo
    {
        return $this->belongsTo(Workshop::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function certificate(): HasOne
    {
        return $this->hasOne(Certificate::class);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    public function isEnrolled(): bool
    {
        return $this->status === 'enrolled';
    }

    public function isOnWaitlist(): bool
    {
        return $this->status === 'waitlist';
    }

    /**
     * A certificate can only be downloaded after attendance is confirmed.
     */
    public function canDownloadCertificate(): bool
    {
        return $this->attended && $this->certificate()->exists();
    }
}
