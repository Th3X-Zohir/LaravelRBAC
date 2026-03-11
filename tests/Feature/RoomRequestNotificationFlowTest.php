<?php

use App\Models\Room;
use App\Models\RoomRequest;
use App\Models\User;
use App\Notifications\RoomRequestNotification;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

it('shows a request detail page to the request owner', function () {
    $owner = User::factory()->create();
    $owner->assignRole('cr');

    $roomRequest = RoomRequest::factory()->for($owner)->create();

    $this->actingAs($owner)
        ->get(route('requests.show', $roomRequest))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('requests/show')
            ->where('roomRequest.id', $roomRequest->id)
            ->where('roomRequest.user.id', $owner->id));
});

it('forbids users from viewing another users request detail page', function () {
    $owner = User::factory()->create();
    $owner->assignRole('cr');

    $otherUser = User::factory()->create();
    $otherUser->assignRole('authenticated');

    $roomRequest = RoomRequest::factory()->for($owner)->create();

    $this->actingAs($otherUser)
        ->get(route('requests.show', $roomRequest))
        ->assertForbidden();
});

it('shows the admin request detail page to superadmins only', function () {
    $superadmin = User::factory()->create();
    $superadmin->assignRole('superadmin');

    $regularUser = User::factory()->create();
    $regularUser->assignRole('cr');

    $roomRequest = RoomRequest::factory()->for($regularUser)->create();

    $this->actingAs($superadmin)
        ->get(route('admin.requests.show', $roomRequest))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/requests/show')
            ->where('roomRequest.id', $roomRequest->id));

    $this->actingAs($regularUser)
        ->get(route('admin.requests.show', $roomRequest))
        ->assertForbidden();
});

it('marks a notification as read and redirects to the request detail page', function () {
    $requester = User::factory()->create();
    $requester->assignRole('cr');

    $room = Room::factory()->create();
    $roomRequest = RoomRequest::factory()
        ->for($requester)
        ->for($room)
        ->approved()
        ->create();

    $requester->notifyNow(new RoomRequestNotification($roomRequest, 'approved'));

    $notification = $requester->notifications()->sole();

    $this->actingAs($requester)
        ->get(route('notifications.visit', $notification->id))
        ->assertRedirect(route('requests.show', $roomRequest));

    expect($notification->fresh()->read_at)->not->toBeNull();
});

it('resolves the notification target from metadata when the stored url is stale', function () {
    $requester = User::factory()->create();
    $requester->assignRole('cr');

    $roomRequest = RoomRequest::factory()->for($requester)->approved()->create();

    $requester->notifyNow(new RoomRequestNotification($roomRequest, 'approved'));

    $notification = $requester->notifications()->sole();
    $notification->forceFill([
        'data' => [
            ...$notification->data,
            'url' => '/broken-target',
        ],
    ])->save();

    $this->actingAs($requester)
        ->get(route('notifications.visit', $notification->id))
        ->assertRedirect(route('requests.show', $roomRequest));
});

it('falls back to the requests index when a requester notification points to a deleted request', function () {
    $requester = User::factory()->create();
    $requester->assignRole('cr');

    $roomRequest = RoomRequest::factory()->for($requester)->approved()->create();

    $requester->notifyNow(new RoomRequestNotification($roomRequest, 'approved'));

    $notification = $requester->notifications()->sole();

    $roomRequest->delete();

    $this->actingAs($requester)
        ->get(route('notifications.visit', $notification->id))
        ->assertRedirect(route('requests.index'));
});

it('does not allow a user to visit another users notification link', function () {
    $owner = User::factory()->create();
    $owner->assignRole('superadmin');

    $otherUser = User::factory()->create();
    $otherUser->assignRole('authenticated');

    $roomRequest = RoomRequest::factory()->for($otherUser)->create();

    $owner->notifyNow(new RoomRequestNotification($roomRequest, 'created'));

    $notification = $owner->notifications()->sole();

    $this->actingAs($otherUser)
        ->get(route('notifications.visit', $notification->id))
        ->assertNotFound();
});

it('stores the correct target url in room request notifications', function () {
    $superadmin = User::factory()->create();
    $superadmin->assignRole('superadmin');

    $requester = User::factory()->create();
    $requester->assignRole('cr');

    $roomRequest = RoomRequest::factory()->for($requester)->create();

    $superadmin->notifyNow(new RoomRequestNotification($roomRequest, 'created'));
    $requester->notifyNow(new RoomRequestNotification($roomRequest, 'approved'));

    expect($superadmin->notifications()->latest()->first()?->data['url'])
        ->toBe(route('admin.requests.show', $roomRequest));

    expect($requester->notifications()->latest()->first()?->data['url'])
        ->toBe(route('requests.show', $roomRequest));
});

it('approving a request rejects overlapping pending requests for the same room and date', function () {
    Notification::fake();

    $superadmin = User::factory()->create();
    $superadmin->assignRole('superadmin');

    $approvedRequester = User::factory()->create();
    $approvedRequester->assignRole('cr');

    $rejectedRequester = User::factory()->create();
    $rejectedRequester->assignRole('cr');

    $room = Room::factory()->create();
    $date = today()->addDays(5)->toDateString();

    $requestToApprove = RoomRequest::factory()
        ->for($approvedRequester)
        ->for($room)
        ->create([
            'date' => $date,
            'start_time' => '08:30',
            'end_time' => '10:00',
        ]);

    $requestToReject = RoomRequest::factory()
        ->for($rejectedRequester)
        ->for($room)
        ->create([
            'date' => $date,
            'start_time' => '08:30',
            'end_time' => '10:00',
        ]);

    $this->actingAs($superadmin)
        ->patch(route('admin.requests.approve', $requestToApprove))
        ->assertSessionHas('success', 'Room request approved.');

    expect($requestToApprove->fresh()?->status)->toBe('approved');
    expect($requestToReject->fresh()?->status)->toBe('rejected');

    Notification::assertSentTo($approvedRequester, RoomRequestNotification::class, function (RoomRequestNotification $notification): bool {
        return $notification->action === 'approved';
    });

    Notification::assertSentTo($rejectedRequester, RoomRequestNotification::class, function (RoomRequestNotification $notification): bool {
        return $notification->action === 'rejected';
    });
});

it('approving a request does not reject requests for a different room or slot', function () {
    Notification::fake();

    $superadmin = User::factory()->create();
    $superadmin->assignRole('superadmin');

    $approvedRequester = User::factory()->create();
    $approvedRequester->assignRole('cr');

    $sameRoomDifferentSlotRequester = User::factory()->create();
    $sameRoomDifferentSlotRequester->assignRole('cr');

    $differentRoomRequester = User::factory()->create();
    $differentRoomRequester->assignRole('cr');

    $room = Room::factory()->create();
    $otherRoom = Room::factory()->create();
    $date = today()->addDays(6)->toDateString();

    $requestToApprove = RoomRequest::factory()
        ->for($approvedRequester)
        ->for($room)
        ->create([
            'date' => $date,
            'start_time' => '08:30',
            'end_time' => '10:00',
        ]);

    $sameRoomDifferentSlot = RoomRequest::factory()
        ->for($sameRoomDifferentSlotRequester)
        ->for($room)
        ->create([
            'date' => $date,
            'start_time' => '10:00',
            'end_time' => '11:30',
        ]);

    $differentRoomRequest = RoomRequest::factory()
        ->for($differentRoomRequester)
        ->for($otherRoom)
        ->create([
            'date' => $date,
            'start_time' => '08:30',
            'end_time' => '10:00',
        ]);

    $this->actingAs($superadmin)
        ->patch(route('admin.requests.approve', $requestToApprove))
        ->assertSessionHas('success', 'Room request approved.');

    expect($sameRoomDifferentSlot->fresh()?->status)->toBe('pending');
    expect($differentRoomRequest->fresh()?->status)->toBe('pending');

    Notification::assertNotSentTo($sameRoomDifferentSlotRequester, RoomRequestNotification::class);
    Notification::assertNotSentTo($differentRoomRequester, RoomRequestNotification::class);
});
