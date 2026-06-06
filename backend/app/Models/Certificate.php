<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A participation certificate linked to a confirmed registration.
 *
 * @property int    $id
 * @property int    $registration_id
 * @property string $file_path
 */
class Certificate extends Model
{
    use HasFactory;

    protected $fillable = ['registration_id', 'file_path'];

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }
}
