<?php

namespace App\Http\Controllers;

use App\Http\Requests\SearchRoomAvailabilityRequest;
use App\Http\Requests\ShowRoomAvailabilityRequest;
use App\Models\Room;
use App\Models\RoomRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('rooms/index', [
            'slots' => RoomRequest::availableSlots(),
        ]);
    }

    public function search(SearchRoomAvailabilityRequest $request): JsonResponse
    {
        $slot = RoomRequest::slotForStartTime($request->string('start_time')->toString());

        if ($slot === null) {
            return response()->json([
                'date' => $request->string('date')->toString(),
                'start_time' => $request->string('start_time')->toString(),
                'end_time' => null,
                'rooms' => [],
            ]);
        }

        $rooms = Room::query()
            ->where('status', 'available')
            ->whereDoesntHave('roomRequests', function ($query) use ($request, $slot): void {
                $query
                    ->whereDate('date', $request->string('date')->toString())
                    ->where('status', 'approved')
                    ->overlapping($slot['start_time'], $slot['end_time']);
            })
            ->withCount(['roomRequests as has_pending_request' => function ($query) use ($request, $slot): void {
                $query
                    ->where('status', 'pending')
                    ->whereDate('date', $request->string('date')->toString())
                    ->overlapping($slot['start_time'], $slot['end_time']);
            }])
            ->orderBy('room_number')
            ->get();

        return response()->json([
            'date' => $request->string('date')->toString(),
            'start_time' => $slot['start_time'],
            'end_time' => $slot['end_time'],
            'rooms' => $rooms,
        ]);
    }

    public function slots(ShowRoomAvailabilityRequest $request, Room $room): JsonResponse
    {
        $bookings = RoomRequest::query()
            ->where('room_id', $room->id)
            ->whereDate('date', $request->string('date')->toString())
            ->where('status', 'approved')
            ->get(['start_time', 'end_time']);

        $slots = collect(RoomRequest::availableSlots())
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

        return response()->json([
            'room_id' => $room->id,
            'date' => $request->string('date')->toString(),
            'slots' => $slots,
        ]);
    }
}
