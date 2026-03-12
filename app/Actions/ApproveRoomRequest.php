<?php

namespace App\Actions;

use App\Models\RoomRequest;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Approve a pending room request, auto-rejecting any overlapping pending requests.
 *
 * @return array{0: RoomRequest, 1: Collection<int, RoomRequest>}
 *
 * @throws ValidationException
 */
class ApproveRoomRequest
{
    public function __invoke(User $reviewer, RoomRequest $roomRequest): array
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

            return [$lockedRequest->fresh(['room', 'user']), $refreshedAutoRejectedRequests];
        });
    }
}
