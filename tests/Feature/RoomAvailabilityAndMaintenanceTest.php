<?php

use App\Models\Room;
use App\Models\RoomRequest;
use App\Models\User;
use App\Notifications\RoleChangedNotification;
use Carbon\Carbon;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

afterEach(function () {
    Carbon::setTestNow();
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

it('localizes role change notifications in the feed', function () {
    Carbon::setTestNow('2026-03-12 09:00:00');

    $user = User::factory()->create();
    $user->assignRole('authenticated');

    $user->notifyNow(new RoleChangedNotification('authenticated', 'cr'));

    $englishResponse = $this->actingAs($user)
        ->withSession(['locale' => 'en'])
        ->getJson(route('notifications.index'));

    $banglaResponse = $this->actingAs($user)
        ->withSession(['locale' => 'bn'])
        ->getJson(route('notifications.index'));

    $englishResponse
        ->assertOk()
        ->assertJsonPath('items.0.title', 'Role Updated')
        ->assertJsonPath('items.0.message', 'Your access changed from Authenticated to CR.');

    $banglaResponse
        ->assertOk()
        ->assertJsonPath('items.0.title', 'রোল আপডেট হয়েছে')
        ->assertJsonPath('items.0.message', 'আপনার অ্যাক্সেস প্রমাণিত ব্যবহারকারী থেকে শ্রেণি প্রতিনিধি করা হয়েছে।');
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
