<?php

namespace App\Services;

use App\Models\Room;
use App\Models\RoomRequest;
use App\Models\User;
use App\Notifications\RoomRequestNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

class RoomService
{
    /**
     * Get available rooms for a specific date and start time slot.
     */
    public function getAvailableRooms(string $date, string $startTime): ?array
    {
        $slot = RoomRequest::slotForStartTime($startTime);

        if ($slot === null) {
            return null;
        }

        $rooms = Room::query()
            ->where('status', 'available')
            ->whereDoesntHave('roomRequests', function ($query) use ($date, $slot): void {
                $query
                    ->whereDate('date', $date)
                    ->where('status', 'approved')
                    ->overlapping($slot['start_time'], $slot['end_time']);
            })
            ->withCount(['roomRequests as has_pending_request' => function ($query) use ($date, $slot): void {
                $query
                    ->where('status', 'pending')
                    ->whereDate('date', $date)
                    ->overlapping($slot['start_time'], $slot['end_time']);
            }])
            ->orderBy('room_number')
            ->get();

        return [
            'start_time' => $slot['start_time'],
            'end_time' => $slot['end_time'],
            'rooms' => $rooms,
        ];
    }

    /**
     * Get all slots for a specific room and date with availability status.
     */
    public function getAvailableSlots(Room $room, string $date): array
    {
        $bookings = RoomRequest::query()
            ->where('room_id', $room->id)
            ->whereDate('date', $date)
            ->where('status', 'approved')
            ->get(['start_time', 'end_time']);

        return collect(RoomRequest::availableSlots())
            ->map(function (array $slot) use ($bookings, $room): array {
                $isAvailable = $room->status === 'available' && ! $bookings->contains(
                    fn (RoomRequest $booking): bool => RoomRequest::timesOverlap(
                        $booking->start_time,
                        $booking->end_time,
                        $slot['start_time'],
                        $slot['end_time'],
                    )
                );

                return [
                    ...$slot,
                    'is_available' => $isAvailable,
                ];
            })
            ->values()
            ->all();
    }

    /**
     * Create a new room booking request.
     */
    public function createRequest(User $user, array $data): RoomRequest
    {
        $roomRequest = RoomRequest::create([
            ...$data,
            'user_id' => $user->id,
            'status' => 'pending',
        ]);

        $roomRequest->load(['room', 'user']);

        $superadmins = User::role('superadmin')->get();
        Notification::send($superadmins, new RoomRequestNotification($roomRequest, 'created'));

        return $roomRequest;
    }

    /**
     * Approve a pending room request, auto-rejecting any overlapping pending requests.
     *
     * @return array{0: RoomRequest, 1: Collection<int, RoomRequest>}
     *
     * @throws ValidationException
     */
    public function approveRequest(User $reviewer, RoomRequest $roomRequest): array
    {
        return DB::transaction(function () use ($reviewer, $roomRequest): array {
            $lockedRequest = RoomRequest::query()
                ->with(['room', 'user'])
                ->lockForUpdate()
                ->findOrFail($roomRequest->id);

            if ($lockedRequest->status !== 'pending') {
                throw ValidationException::withMessages([
                    'status' => [__('app.validation.only_pending_can_be_approved')],
                ]);
            }

            $overlappingRequests = RoomRequest::query()
                ->with(['room', 'user'])
                ->where('room_id', $lockedRequest->room_id)
                ->whereDate('date', $lockedRequest->date->toDateString())
                ->whereIn('status', ['pending', 'approved'])
                ->overlapping($lockedRequest->start_time, $lockedRequest->end_time)
                ->lockForUpdate()
                ->get();

            $hasConflict = $overlappingRequests
                ->where('status', 'approved')
                ->where('id', '!=', $lockedRequest->id)
                ->isNotEmpty();

            if ($hasConflict) {
                throw ValidationException::withMessages([
                    'status' => [__('app.validation.time_slot_already_approved')],
                ]);
            }

            $reviewedAt = now();

            $lockedRequest->forceFill([
                'status' => 'approved',
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => $reviewedAt,
            ])->save();

            $autoRejectedRequests = $overlappingRequests
                ->where('status', 'pending')
                ->where('id', '!=', $lockedRequest->id)
                ->values();

            $autoRejectedRequests->each(function (RoomRequest $pendingRequest) use ($reviewer, $reviewedAt): void {
                $pendingRequest->forceFill([
                    'status' => 'rejected',
                    'reviewed_by' => $reviewer->id,
                    'reviewed_at' => $reviewedAt,
                ])->save();
            });

            $refreshedAutoRejectedRequests = RoomRequest::query()
                ->with(['room', 'user'])
                ->whereKey($autoRejectedRequests->modelKeys())
                ->get();

            $lockedRequest->user->notify(new RoomRequestNotification($lockedRequest, 'approved'));

            $refreshedAutoRejectedRequests->each(function (RoomRequest $request): void {
                $request->user->notify(new RoomRequestNotification($request, 'rejected'));
            });

            return [$lockedRequest->fresh(['room', 'user']), $refreshedAutoRejectedRequests];
        });
    }

    /**
     * Reject a room request.
     */
    public function rejectRequest(User $reviewer, RoomRequest $roomRequest): RoomRequest
    {
        $roomRequest->update([
            'status' => 'rejected',
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
        ]);

        $roomRequest->load(['room', 'user']);
        $roomRequest->user->notify(new RoomRequestNotification($roomRequest, 'rejected'));

        return $roomRequest;
    }

    /**
     * Cancel a room request.
     */
    public function cancelRequest(RoomRequest $roomRequest): void
    {
        $roomRequest->delete();
    }

    /**
     * Reject expired pending room requests.
     */
    public function rejectExpiredRequests(): int
    {
        return RoomRequest::query()
            ->where('status', 'pending')
            ->whereDate('date', '<', today()->toDateString())
            ->update([
                'status' => 'rejected',
                'reviewed_at' => now(),
            ]);
    }
}
