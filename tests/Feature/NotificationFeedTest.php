<?php

use App\Models\RoomRequest;
use App\Models\User;
use App\Notifications\RoomRequestNotification;
use Carbon\Carbon;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

afterEach(function () {
    Carbon::setTestNow();
});

it('returns the notification feed payload from the dedicated endpoint', function () {
    Carbon::setTestNow('2026-03-12 09:00:00');

    $requester = User::factory()->create();
    $requester->assignRole('cr');

    $roomRequest = RoomRequest::factory()->for($requester)->approved()->create([
        'date' => '2026-03-12',
    ]);

    $requester->notifyNow(new RoomRequestNotification($roomRequest, 'approved'));
    $notification = $requester->notifications()->sole();

    $response = $this->actingAs($requester)->getJson(route('notifications.index'));

    $response
        ->assertOk()
        ->assertJsonPath('unreadCount', 1)
        ->assertJsonCount(1, 'items')
        ->assertJsonPath('items.0.id', $notification->id)
        ->assertJsonPath('items.0.title', __('app.notifications.approved_title'))
        ->assertJsonPath('items.0.message', __('app.notifications.approved_message', [
            'room' => $roomRequest->room->room_number,
            'date' => 'Mar 12, 2026',
        ]))
        ->assertJsonPath('items.0.read', false)
        ->assertJsonPath('items.0.visit_url', route('notifications.visit', $notification->id));
});

it('localizes the same notification payload using the current session locale', function () {
    Carbon::setTestNow('2026-03-12 09:00:00');

    $requester = User::factory()->create();
    $requester->assignRole('cr');

    $roomRequest = RoomRequest::factory()->for($requester)->approved()->create([
        'date' => '2026-03-12',
    ]);

    $requester->notifyNow(new RoomRequestNotification($roomRequest, 'approved'));

    $englishResponse = $this->actingAs($requester)
        ->withSession(['locale' => 'en'])
        ->getJson(route('notifications.index'));

    $banglaResponse = $this->actingAs($requester)
        ->withSession(['locale' => 'bn'])
        ->getJson(route('notifications.index'));

    $englishResponse
        ->assertOk()
        ->assertJsonPath('items.0.title', 'Room Request Approved')
        ->assertJsonPath('items.0.message', 'Your request for room '.$roomRequest->room->room_number.' on Mar 12, 2026 has been approved.');

    $banglaResponse
        ->assertOk()
        ->assertJsonPath('items.0.title', 'রুম অনুরোধ অনুমোদিত')
        ->assertJsonPath('items.0.message', 'মার্চ ১২, ২০২৬ তারিখে '.$roomRequest->room->room_number.' রুমের জন্য আপনার অনুরোধটি অনুমোদিত হয়েছে।');
});

it('shares the same notifications payload with inertia pages', function () {
    $user = User::factory()->create();
    $user->assignRole('cr');

    $roomRequest = RoomRequest::factory()->for($user)->approved()->create();

    $user->notifyNow(new RoomRequestNotification($roomRequest, 'approved'));
    $notification = $user->notifications()->sole();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('notifications.unreadCount', 1)
            ->where('notifications.items.0.id', $notification->id)
            ->where('notifications.items.0.visit_url', route('notifications.visit', $notification->id)));
});

it('updates the feed after marking all notifications as read', function () {
    $user = User::factory()->create();
    $user->assignRole('cr');

    $roomRequest = RoomRequest::factory()->for($user)->approved()->create();

    $user->notifyNow(new RoomRequestNotification($roomRequest, 'approved'));

    $this->actingAs($user)
        ->postJson(route('notifications.read-all'))
        ->assertNoContent();

    $this->actingAs($user)
        ->getJson(route('notifications.index'))
        ->assertOk()
        ->assertJsonPath('unreadCount', 0)
        ->assertJsonPath('items.0.read', true);
});

it('redirects guests away from the notifications endpoint', function () {
    $this->get(route('notifications.index'))->assertRedirect(route('login'));
});
