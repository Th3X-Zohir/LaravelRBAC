<?php

namespace App\Services;

use App\Models\Room;
use App\Models\RoomRequest;
use App\Models\User;
use Illuminate\Support\Collection;

class DashboardService
{
    /**
     * Get aggregate statistics for the user's dashboard.
     *
     * @return array<string, int|null>
     */
    public function getUserStats(User $user): array
    {
        $isSuperadmin = $user->hasRole('superadmin');

        return [
            'total_rooms' => Room::query()->count(),
            'available_rooms' => Room::query()->where('status', 'available')->count(),
            'occupied_rooms' => Room::query()->where('status', 'occupied')->count(),
            'maintenance_rooms' => Room::query()->where('status', 'maintenance')->count(),
            'my_pending_requests' => RoomRequest::query()
                ->where('user_id', $user->id)
                ->where('status', 'pending')
                ->count(),
            'my_approved_requests' => RoomRequest::query()
                ->where('user_id', $user->id)
                ->where('status', 'approved')
                ->count(),
            'my_total_requests' => RoomRequest::query()
                ->where('user_id', $user->id)
                ->count(),
            'pending_approvals' => $isSuperadmin
                ? RoomRequest::query()->where('status', 'pending')->count()
                : null,
            'total_users' => $isSuperadmin ? User::query()->count() : null,
        ];
    }

    /**
     * Get recent room requests for the authenticated user.
     *
     * @return Collection<int, array>
     */
    public function getRecentRequestsForUser(User $user, int $limit = 5): Collection
    {
        return RoomRequest::query()
            ->with(['room', 'reviewer'])
            ->where('user_id', $user->id)
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (RoomRequest $roomRequest) => [
                'id' => $roomRequest->id,
                'date' => $roomRequest->date->toDateString(),
                'start_time' => $roomRequest->start_time,
                'end_time' => $roomRequest->end_time,
                'purpose' => $roomRequest->purpose,
                'status' => $roomRequest->status,
                'created_at' => $roomRequest->created_at->toISOString(),
                'room' => [
                    'id' => $roomRequest->room->id,
                    'room_number' => $roomRequest->room->room_number,
                    'status' => $roomRequest->room->status,
                ],
                'reviewer' => $roomRequest->reviewer ? [
                    'id' => $roomRequest->reviewer->id,
                    'name' => $roomRequest->reviewer->name,
                    'email' => $roomRequest->reviewer->email,
                ] : null,
            ])
            ->values();
    }

    /**
     * Get pending requests that require superadmin review.
     *
     * @return Collection<int, array>
     */
    public function getPendingRequestsForAdmin(int $limit = 5): Collection
    {
        return RoomRequest::query()
            ->with(['room', 'user'])
            ->where('status', 'pending')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (RoomRequest $roomRequest) => [
                'id' => $roomRequest->id,
                'date' => $roomRequest->date->toDateString(),
                'start_time' => $roomRequest->start_time,
                'end_time' => $roomRequest->end_time,
                'purpose' => $roomRequest->purpose,
                'created_at' => $roomRequest->created_at->toISOString(),
                'room' => [
                    'id' => $roomRequest->room->id,
                    'room_number' => $roomRequest->room->room_number,
                ],
                'user' => [
                    'id' => $roomRequest->user->id,
                    'name' => $roomRequest->user->name,
                    'email' => $roomRequest->user->email,
                ],
            ])
            ->values();
    }
}
