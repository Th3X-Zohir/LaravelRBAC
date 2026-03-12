<?php

namespace App\Http\Controllers;

use App\Http\Requests\SearchRoomAvailabilityRequest;
use App\Http\Requests\ShowRoomAvailabilityRequest;
use App\Models\Room;
use App\Models\RoomRequest;
use App\Services\RoomService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    /**
     * Display a listing of available slots.
     */
    public function index(): Response
    {
        return Inertia::render('rooms/index', [
            'slots' => RoomRequest::availableSlots(),
        ]);
    }

    /**
     * Search for available rooms in a specific slot.
     */
    public function search(SearchRoomAvailabilityRequest $request, RoomService $roomService): JsonResponse
    {
        $result = $roomService->getAvailableRooms(
            $request->string('date')->toString(),
            $request->string('start_time')->toString()
        );

        if ($result === null) {
            return response()->json([
                'date' => $request->string('date')->toString(),
                'start_time' => $request->string('start_time')->toString(),
                'end_time' => null,
                'rooms' => [],
            ]);
        }

        return response()->json([
            'date' => $request->string('date')->toString(),
            'start_time' => $result['start_time'],
            'end_time' => $result['end_time'],
            'rooms' => $result['rooms'],
        ]);
    }

    /**
     * Get availability slots for a specific room.
     */
    public function slots(ShowRoomAvailabilityRequest $request, Room $room, RoomService $roomService): JsonResponse
    {
        $slots = $roomService->getAvailableSlots(
            $room,
            $request->string('date')->toString()
        );

        return response()->json([
            'room_id' => $room->id,
            'date' => $request->string('date')->toString(),
            'slots' => $slots,
        ]);
    }
}
