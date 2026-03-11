<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    /** @use HasFactory<\Database\Factories\RoomFactory> */
    use HasFactory;

    protected $fillable = [
        'room_number',
        'status',
    ];

    /**
     * @return HasMany<RoomRequest, $this>
     */
    public function roomRequests(): HasMany
    {
        return $this->hasMany(RoomRequest::class);
    }
}
