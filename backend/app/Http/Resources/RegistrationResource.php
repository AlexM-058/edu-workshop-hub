<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * JSON representation of a Registration (attender's perspective).
 *
 * Embeds the related workshop so the frontend doesn't need a second request.
 */
class RegistrationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $workshop = $this->whenLoaded('workshop');
        $locale   = $request->query('locale', 'ro');

        return [
            'id'         => $this->id,
            'status'     => $this->status,    // enrolled | waitlist | cancelled
            'attended'   => $this->attended,
            'created_at' => $this->created_at->toIso8601String(),

            // Inline workshop snapshot — avoids N+1 on list
            'workshop' => $workshop ? [
                'id'           => $workshop->id,
                'title'        => [
                    'ro' => $workshop->title_ro,
                    'de' => $workshop->title_de,
                ],
                'description'  => [
                    'ro' => $workshop->description_ro,
                    'de' => $workshop->description_de,
                ],
                'location'     => $workshop->location,
                'scheduled_at' => $workshop->scheduled_at->toIso8601String(),
                'ends_at'      => $workshop->ends_at?->toIso8601String(),
                'max_slots'    => $workshop->max_slots,
                'referent'     => $workshop->referent ? [
                    'id'   => $workshop->referent->id,
                    'name' => $workshop->referent->fullName(),
                ] : null,
            ] : null,

            // Certificate availability — true only after attendance is confirmed
            'has_certificate'          => (bool) $this->attended && $this->certificate !== null,
            'can_download_certificate' => $this->attended && $this->certificate !== null,
        ];
    }
}
