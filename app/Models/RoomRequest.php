<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomRequest extends Model
{
    /** @use HasFactory<\Database\Factories\RoomRequestFactory> */
    use HasFactory;

    /**
     * @var array<int, array{start_time: string, end_time: string, label: string}>
     */
    public const AVAILABLE_SLOTS = [
        ['start_time' => '08:30', 'end_time' => '10:00', 'label' => '08:30 - 10:00'],
        ['start_time' => '10:00', 'end_time' => '11:30', 'label' => '10:00 - 11:30'],
        ['start_time' => '11:30', 'end_time' => '13:00', 'label' => '11:30 - 13:00'],
        ['start_time' => '13:00', 'end_time' => '14:30', 'label' => '13:00 - 14:30'],
        ['start_time' => '14:30', 'end_time' => '16:00', 'label' => '14:30 - 16:00'],
        ['start_time' => '16:00', 'end_time' => '17:30', 'label' => '16:00 - 17:30'],
    ];

    protected $fillable = [
        'user_id',
        'room_id',
        'date',
        'start_time',
        'end_time',
        'purpose',
        'status',
        'reviewed_by',
        'reviewed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * @return array<int, array{start_time: string, end_time: string, label: string}>
     */
    public static function availableSlots(): array
    {
        return self::AVAILABLE_SLOTS;
    }

    /**
     * @return array{start_time: string, end_time: string, label: string}|null
     */
    public static function slotForStartTime(string $startTime): ?array
    {
        foreach (self::AVAILABLE_SLOTS as $slot) {
            if ($slot['start_time'] === $startTime) {
                return $slot;
            }
        }

        return null;
    }

    public static function timesOverlap(
        string $firstStartTime,
        string $firstEndTime,
        string $secondStartTime,
        string $secondEndTime,
    ): bool {
        return $firstStartTime < $secondEndTime && $firstEndTime > $secondStartTime;
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeOverlapping(Builder $query, string $startTime, string $endTime): Builder
    {
        return $query
            ->where('start_time', '<', $endTime)
            ->where('end_time', '>', $startTime);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Room, $this>
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
