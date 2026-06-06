<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'teacher_id',
    'referent_id',
    'title',
    'title_ro',
    'title_de',
    'category',
    'description',
    'description_ro',
    'description_de',
    'coordinator_name',
    'coordinator_bio',
    'starts_at',
    'ends_at',
    'duration',
    'capacity',
    'max_slots',
    'occupied_slots',
    'location',
    'status',
    'scheduled_at',
    'is_active',
])]
class Workshop extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'starts_at' => 'date',
            'ends_at' => 'date',
            'scheduled_at' => 'datetime',
            'capacity' => 'integer',
            'max_slots' => 'integer',
            'occupied_slots' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function referent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referent_id');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(WorkshopEnrollment::class);
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
        $capacity = $this->max_slots ?? $this->capacity;

        if ($capacity === null) {
            return true;
        }

        return (int) $this->occupied_slots < (int) $capacity;
    }
}
