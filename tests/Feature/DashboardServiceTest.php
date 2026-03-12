<?php

use App\Models\Room;
use App\Models\RoomRequest;
use App\Models\User;
use App\Services\DashboardService;
use Spatie\Permission\Models\Role;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

it('calculates correct dashboard statistics for a standard user', function () {
    $service = app(DashboardService::class);
    $user = User::factory()->create();

    // Clear any existing rooms that might have been seeded globally or left over
    Room::query()->delete();
    RoomRequest::query()->delete();

    $rooms = Room::factory()->count(2)->create(['status' => 'available']);
    $room = Room::factory()->create(['status' => 'occupied']);

    // Create a mix of requests for the user
    RoomRequest::factory()->count(2)->create([
        'user_id' => $user->id,
        'room_id' => $rooms[0]->id,
        'status' => 'pending',
    ]);
    RoomRequest::factory()->create([
        'user_id' => $user->id,
        'room_id' => $rooms[1]->id,
        'status' => 'approved',
    ]);

    // Create a request for another user (should not be counted for this user)
    RoomRequest::factory()->create([
        'user_id' => User::factory()->create()->id,
        'room_id' => $room->id,
        'status' => 'pending',
    ]);

    $stats = $service->getUserStats($user);

    expect($stats['total_rooms'])->toBe(3)
        ->and($stats['available_rooms'])->toBe(2)
        ->and($stats['occupied_rooms'])->toBe(1)
        ->and($stats['maintenance_rooms'])->toBe(0)
        ->and($stats['my_pending_requests'])->toBe(2)
        ->and($stats['my_approved_requests'])->toBe(1)
        ->and($stats['my_total_requests'])->toBe(3)
        ->and($stats['pending_approvals'])->toBeNull()
        ->and($stats['total_users'])->toBeNull();
});

it('calculates correct dashboard statistics for a superadmin', function () {
    $service = app(DashboardService::class);
    $admin = User::factory()->create()->assignRole('superadmin');

    // Clear any existing rooms that might have been seeded globally or left over
    Room::query()->delete();
    RoomRequest::query()->delete();

    $room = Room::factory()->create(['status' => 'maintenance']);

    // Admin has 1 pending request
    RoomRequest::factory()->create([
        'user_id' => $admin->id,
        'room_id' => $room->id,
        'status' => 'pending',
    ]);

    // Another user has 2 pending requests
    RoomRequest::factory()->count(2)->create([
        'user_id' => User::factory()->create()->id,
        'room_id' => $room->id,
        'status' => 'pending',
    ]);

    $stats = $service->getUserStats($admin);

    expect($stats['maintenance_rooms'])->toBe(1)
        ->and($stats['my_pending_requests'])->toBe(1)
        // Admin should see ALL pending requests (1 from admin, 2 from other user = 3 total)
        ->and($stats['pending_approvals'])->toBe(3)
        ->and($stats['total_users'])->toBeGreaterThanOrEqual(2);
});

it('maps recent requests for a user correctly', function () {
    $service = app(DashboardService::class);
    $user = User::factory()->create();
    
    // Clear any existing rooms that might have been seeded globally or left over
    Room::query()->delete();
    RoomRequest::query()->delete();

    $room = Room::factory()->create(['room_number' => '101', 'status' => 'available']);

    $request = RoomRequest::factory()->create([
        'user_id' => $user->id,
        'room_id' => $room->id,
        'purpose' => 'Team Meeting',
        'status' => 'pending',
    ]);

    $recentRequests = $service->getRecentRequestsForUser($user);

    expect($recentRequests)->toHaveCount(1)
        ->and($recentRequests[0]['id'])->toBe($request->id)
        ->and($recentRequests[0]['purpose'])->toBe('Team Meeting')
        ->and($recentRequests[0]['room']['room_number'])->toBe('101');
});
