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
        $referent = $this->whenLoaded('referent');

        return [
            'id'          => $this->id,
            'title'       => [
                'ro' => $this->title_ro,
                'de' => $this->title_de,
            ],
            'description' => [
                'ro' => $this->description_ro,
                'de' => $this->description_de,
            ],
            'location'       => $this->location,
            'max_slots'      => $this->max_slots,
            'occupied_slots' => $this->occupied_slots,
            'available_slots' => max(0, $this->max_slots - $this->occupied_slots),
            'is_open'        => $this->hasAvailableSlots() && $this->is_active,
            'scheduled_at'   => $this->scheduled_at->toIso8601String(),
            'is_active'      => $this->is_active,
            'referent'       => $referent ? [
                'id'   => $referent->id,
                'name' => $referent->fullName(),
            ] : null,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
