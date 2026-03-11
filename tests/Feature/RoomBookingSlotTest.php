<?php

use App\Models\Room;
use App\Models\RoomRequest;
use App\Models\User;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

it('stores a room request for a valid fixed 90 minute slot', function () {
    $user = User::factory()->create();
    $user->assignRole('cr');

    $room = Room::factory()->create([
        'status' => 'available',
    ]);

    $date = today()->addDay()->toDateString();

    $this->actingAs($user)
        ->post(route('requests.store'), [
            'room_id' => $room->id,
            'date' => $date,
            'start_time' => '08:30',
            'end_time' => '10:00',
            'purpose' => 'Department presentation.',
        ])
        ->assertRedirect(route('requests.index'));

    $roomRequest = RoomRequest::query()->sole();

    expect($roomRequest->room_id)->toBe($room->id);
    expect($roomRequest->user_id)->toBe($user->id);
    expect($roomRequest->date->toDateString())->toBe($date);
    expect($roomRequest->start_time)->toBe('08:30');
    expect($roomRequest->end_time)->toBe('10:00');
    expect($roomRequest->status)->toBe('pending');
});

it('rejects a room request outside the fixed slot schedule', function () {
    $user = User::factory()->create();
    $user->assignRole('cr');

    $room = Room::factory()->create([
        'status' => 'available',
    ]);

    $this->actingAs($user)
        ->post(route('requests.store'), [
            'room_id' => $room->id,
            'date' => today()->addDay()->toDateString(),
            'start_time' => '09:00',
            'end_time' => '10:30',
            'purpose' => 'Invalid slot test.',
        ])
        ->assertInvalid(['start_time']);
});

it('rejects a slot that overlaps an existing booking on the same date', function () {
    $user = User::factory()->create();
    $user->assignRole('cr');

    $room = Room::factory()->create([
        'status' => 'available',
    ]);

    $date = today()->addDays(2)->toDateString();

    RoomRequest::factory()->create([
        'room_id' => $room->id,
        'date' => $date,
        'start_time' => '08:30',
        'end_time' => '10:00',
        'status' => 'approved',
    ]);

    $this->actingAs($user)
        ->post(route('requests.store'), [
            'room_id' => $room->id,
            'date' => $date,
            'start_time' => '08:30',
            'end_time' => '10:00',
            'purpose' => 'Conflicting request.',
        ])
        ->assertInvalid([
            'start_time' => 'already booked',
        ]);
});

it('returns slot availability for a room on a selected date', function () {
    $user = User::factory()->create();
    $user->assignRole('authenticated');

    $room = Room::factory()->create([
        'status' => 'available',
    ]);

    $date = today()->addDays(3)->toDateString();

    RoomRequest::factory()->create([
        'room_id' => $room->id,
        'date' => $date,
        'start_time' => '10:00',
        'end_time' => '11:30',
        'status' => 'approved',
    ]);

    $this->actingAs($user)
        ->getJson(route('rooms.slots', $room).'?date='.$date)
        ->assertSuccessful()
        ->assertJsonPath('room_id', $room->id)
        ->assertJsonPath('date', $date)
        ->assertJsonPath('slots.0.start_time', '08:30')
        ->assertJsonPath('slots.0.is_available', true)
        ->assertJsonPath('slots.1.start_time', '10:00')
        ->assertJsonPath('slots.1.is_available', false);
});

it('keeps rooms visible when there is only a pending request for the selected slot', function () {
    $room = Room::factory()->create([
        'status' => 'available',
    ]);

    $date = today()->addDays(3)->toDateString();

    RoomRequest::factory()->create([
        'room_id' => $room->id,
        'date' => $date,
        'start_time' => '08:30',
        'end_time' => '10:00',
        'status' => 'pending',
    ]);

    $this->getJson(route('rooms.search', [
        'date' => $date,
        'start_time' => '08:30',
    ]))
        ->assertSuccessful()
        ->assertJsonCount(1, 'rooms')
        ->assertJsonPath('rooms.0.id', $room->id)
        ->assertJsonPath('rooms.0.has_pending_request', 1);
});

it('allows a new request when the same slot only has pending requests', function () {
    $user = User::factory()->create();
    $user->assignRole('cr');

    $room = Room::factory()->create([
        'status' => 'available',
    ]);

    $date = today()->addDays(2)->toDateString();

    RoomRequest::factory()->create([
        'room_id' => $room->id,
        'date' => $date,
        'start_time' => '08:30',
        'end_time' => '10:00',
        'status' => 'pending',
    ]);

    $this->actingAs($user)
        ->post(route('requests.store'), [
            'room_id' => $room->id,
            'date' => $date,
            'start_time' => '08:30',
            'end_time' => '10:00',
            'purpose' => 'Follow-up classroom session.',
        ])
        ->assertRedirect(route('requests.index'));

    expect(RoomRequest::query()->count())->toBe(2);
});

it('returns only rooms available for a selected date and slot', function () {
    $user = User::factory()->create();
    $user->assignRole('authenticated');

    $freeRoom = Room::factory()->create([
        'room_number' => '101',
        'status' => 'available',
    ]);

    $bookedRoom = Room::factory()->create([
        'room_number' => '102',
        'status' => 'available',
    ]);

    Room::factory()->create([
        'room_number' => '103',
        'status' => 'maintenance',
    ]);

    $date = today()->addDays(4)->toDateString();

    RoomRequest::factory()->create([
        'room_id' => $bookedRoom->id,
        'date' => $date,
        'start_time' => '08:30',
        'end_time' => '10:00',
        'status' => 'approved',
    ]);

    $this->actingAs($user)
        ->getJson(route('rooms.search', [
            'date' => $date,
            'start_time' => '08:30',
        ]))
        ->assertSuccessful()
        ->assertJsonPath('date', $date)
        ->assertJsonPath('start_time', '08:30')
        ->assertJsonPath('end_time', '10:00')
        ->assertJsonCount(1, 'rooms')
        ->assertJsonPath('rooms.0.id', $freeRoom->id)
        ->assertJsonPath('rooms.0.room_number', '101');
});
