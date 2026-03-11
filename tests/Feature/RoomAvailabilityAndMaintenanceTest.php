<?php

use App\Models\Room;
use App\Models\RoomRequest;
use App\Models\User;
use App\Notifications\RoleChangedNotification;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

it('allows guests to browse the room availability page and search results', function () {
    $room = Room::factory()->create([
        'status' => 'available',
    ]);

    $date = today()->addDays(5)->toDateString();

    $this->get(route('rooms.index'))
        ->assertSuccessful();

    $this->getJson(route('rooms.search', [
        'date' => $date,
        'start_time' => '08:30',
    ]))
        ->assertSuccessful()
        ->assertJsonCount(1, 'rooms')
        ->assertJsonPath('rooms.0.id', $room->id);

    $this->getJson(route('rooms.slots', $room).'?date='.$date)
        ->assertSuccessful()
        ->assertJsonPath('slots.0.is_available', true);
});

it('sends a notification when a superadmin changes a users role', function () {
    Notification::fake();

    $superadmin = User::factory()->create();
    $superadmin->assignRole('superadmin');

    $user = User::factory()->create();
    $user->assignRole('authenticated');

    $this->actingAs($superadmin)
        ->patch(route('admin.users.update-role', $user), [
            'role' => 'cr',
        ])
        ->assertSessionHas('success', "Role updated to cr for {$user->name}.");

    expect($user->fresh()?->getRoleNames()->first())->toBe('cr');

    Notification::assertSentTo(
        $user,
        RoleChangedNotification::class,
        function (RoleChangedNotification $notification): bool {
            return $notification->previousRole === 'authenticated'
                && $notification->newRole === 'cr';
        },
    );
});

it('rejects expired pending room requests via the cleanup command', function () {
    $expiredPendingRequest = RoomRequest::factory()->create([
        'date' => today()->subDay()->toDateString(),
        'status' => 'pending',
    ]);

    $futurePendingRequest = RoomRequest::factory()->create([
        'date' => today()->addDay()->toDateString(),
        'status' => 'pending',
    ]);

    $approvedPastRequest = RoomRequest::factory()->approved()->create([
        'date' => today()->subDay()->toDateString(),
    ]);

    Artisan::call('requests:reject-expired');

    expect($expiredPendingRequest->fresh()?->status)->toBe('rejected');
    expect($expiredPendingRequest->fresh()?->reviewed_at)->not->toBeNull();
    expect($futurePendingRequest->fresh()?->status)->toBe('pending');
    expect($approvedPastRequest->fresh()?->status)->toBe('approved');
});
