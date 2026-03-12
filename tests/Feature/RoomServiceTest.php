<?php

use App\Models\Room;
use App\Models\RoomRequest;
use App\Services\RoomService;

it('returns available rooms for a given slot', function () {
    $service = app(RoomService::class);
    $date = today()->addDay()->toDateString();

    // Create an available room
    $room1 = Room::factory()->create(['status' => 'available', 'room_number' => '101']);

    // Create an unavailable room (maintenance)
    $room2 = Room::factory()->create(['status' => 'maintenance', 'room_number' => '102']);

    // Create a room that is already booked for the exact slot
    $room3 = Room::factory()->create(['status' => 'available', 'room_number' => '103']);
    RoomRequest::factory()->approved()->create([
        'room_id' => $room3->id,
        'date' => $date,
        'start_time' => '08:30',
        'end_time' => '10:00',
    ]);

    // Test the 08:30 slot
    $result = $service->getAvailableRooms($date, '08:30');

    expect($result)->not->toBeNull()
        ->and($result['start_time'])->toBe('08:30')
        ->and($result['rooms']->pluck('id')->toArray())->toContain($room1->id)
        ->and($result['rooms']->pluck('id')->toArray())->not->toContain($room2->id)
        ->and($result['rooms']->pluck('id')->toArray())->not->toContain($room3->id);
});

it('rejects expired pending room requests', function () {
    $service = app(RoomService::class);

    // Create an expired pending request
    $expiredRequest = RoomRequest::factory()->create([
        'date' => today()->subDay()->toDateString(),
        'status' => 'pending',
    ]);

    // Create a future pending request
    $futureRequest = RoomRequest::factory()->create([
        'date' => today()->addDay()->toDateString(),
        'status' => 'pending',
    ]);

    $rejectedCount = $service->rejectExpiredRequests();

    expect($rejectedCount)->toBeGreaterThanOrEqual(1)
        ->and($expiredRequest->fresh()->status)->toBe('rejected')
        ->and($futureRequest->fresh()->status)->toBe('pending');
});
