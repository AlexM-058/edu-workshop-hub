<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
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
])]
class Workshop extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'scheduled_at'   => 'datetime',
            'max_slots'      => 'integer',
            'occupied_slots' => 'integer',
            'is_active'      => 'boolean',
        ];
    }

    public function referent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referent_id');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where(function (Builder $query): void {
            $query->whereNull('scheduled_at')->orWhere('scheduled_at', '>', now());
        });
    }

    public function hasAvailableSlots(): bool
    {
        if ($this->max_slots === null || $this->max_slots === 0) {
            return true;
        }

        return (int) $this->occupied_slots < (int) $this->max_slots;
    }
}
