<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\RoomRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isSuperadmin = $user->hasRole('superadmin');

        $stats = [
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

        $recentRequests = RoomRequest::query()
            ->with(['room', 'reviewer'])
            ->where('user_id', $user->id)
            ->latest()
            ->limit(5)
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

        $pendingRequests = $isSuperadmin
            ? RoomRequest::query()
                ->with(['room', 'user'])
                ->where('status', 'pending')
                ->latest()
                ->limit(5)
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
                ->values()
            : [];

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentRequests' => $recentRequests,
            'pendingRequests' => $pendingRequests,
        ]);
    }
}
