<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Workshop created and managed by a referent (teacher).
 *
 * @property int         $id
 * @property int         $referent_id
 * @property string      $title_ro
 * @property string      $title_de
 * @property string|null $description_ro
 * @property string|null $description_de
 * @property string      $location
 * @property int         $max_slots
 * @property int         $occupied_slots
 * @property \Carbon\Carbon $scheduled_at
 * @property bool        $is_active
 */
class Workshop extends Model
{
    use HasFactory;

    protected $fillable = [
        'referent_id',
        'title_ro',
        'title_de',
        'description_ro',
        'description_de',
        'location',
        'max_slots',
        'occupied_slots',
        'scheduled_at',
        'is_active',
    ];

    protected $casts = [
        'scheduled_at'  => 'datetime',
        'is_active'     => 'boolean',
        'max_slots'     => 'integer',
        'occupied_slots' => 'integer',
    ];

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    public function referent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referent_id');
    }

    // -------------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------------

    /** Only active workshops visible in the public catalog. */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /** Upcoming workshops (scheduled in the future). */
    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('scheduled_at', '>', now());
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /** Returns true when there are free seats. */
    public function hasAvailableSlots(): bool
    {
        return $this->occupied_slots < $this->max_slots;
    }
}
