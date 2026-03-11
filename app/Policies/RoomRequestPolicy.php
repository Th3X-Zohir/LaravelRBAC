<?php

namespace App\Policies;

use App\Models\RoomRequest;
use App\Models\User;

class RoomRequestPolicy
{
    /**
     * Determine whether the user can view the room request (own request only for non-admin).
     */
    public function view(User $user, RoomRequest $roomRequest): bool
    {
        return $roomRequest->user_id === $user->id;
    }

    /**
     * Determine whether the user can cancel the room request.
     */
    public function cancel(User $user, RoomRequest $roomRequest): bool
    {
        return $user->can('cancel own request')
            && $roomRequest->user_id === $user->id
            && $roomRequest->status === 'pending';
    }

    /**
     * Determine whether the user can approve the room request.
     */
    public function approve(User $user, RoomRequest $roomRequest): bool
    {
        return $user->can('approve request') && $roomRequest->status === 'pending';
    }

    /**
     * Determine whether the user can reject the room request.
     */
    public function reject(User $user, RoomRequest $roomRequest): bool
    {
        return $user->can('reject request') && $roomRequest->status === 'pending';
    }
}
