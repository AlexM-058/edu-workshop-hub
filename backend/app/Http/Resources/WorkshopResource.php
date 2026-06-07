<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * JSON representation of a Workshop.
 *
 * Titles and descriptions are returned as a locale-keyed object so the
 * frontend can pick the right language without branching:
 *   workshop.title.ro  /  workshop.title.de
 */
class WorkshopResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $capacity = $this->max_slots ?? $this->capacity ?? 0;
        $scheduledAt = $this->scheduled_at ?? $this->starts_at;

        return [
            'id'          => $this->id,
            'title'       => [
                'ro' => $this->title_ro ?? $this->title,
                'de' => $this->title_de ?? $this->title,
            ],
            'description' => [
                'ro' => $this->description_ro ?? $this->description,
                'de' => $this->description_de ?? $this->description,
            ],
            'location'       => $this->location,
            'max_slots'      => $capacity,
            'occupied_slots' => (int) $this->occupied_slots,
            'available_slots' => max(0, $capacity - (int) $this->occupied_slots),
            'is_open'        => $this->hasAvailableSlots() && ($this->is_active || $this->status === 'published'),
            'scheduled_at'   => $scheduledAt?->toIso8601String(),
            'is_active'      => $this->is_active || $this->status === 'published',
            'category_id'    => $this->category_id,
            'category'       => $this->category ? [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'icon' => $this->category->icon,
            ] : null,
            'coordinator_name' => $this->coordinator_name,
            'coordinator_bio'  => $this->coordinator_bio,
            'ends_at'        => $this->ends_at?->toIso8601String(),
            'duration'       => $this->duration,
            'cost'           => $this->cost,
            'cover_image_base64' => $this->cover_image_base64,
            'professor_image_base64' => $this->professor_image_base64,
            'referent'       => $this->relationLoaded('referent') && $this->referent ? [
                'id'   => $this->referent->id,
                'name' => $this->referent->fullName(),
            ] : null,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
