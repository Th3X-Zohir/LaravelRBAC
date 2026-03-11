<?php

use App\Models\RoomRequest;
use App\Models\User;
use App\Notifications\RoomRequestNotification;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

it('returns the notification feed payload from the dedicated endpoint', function () {
    $requester = User::factory()->create();
    $requester->assignRole('cr');

    $roomRequest = RoomRequest::factory()->for($requester)->approved()->create();

    $requester->notifyNow(new RoomRequestNotification($roomRequest, 'approved'));
    $notification = $requester->notifications()->sole();

    $response = $this->actingAs($requester)->getJson(route('notifications.index'));

    $response
        ->assertOk()
        ->assertJsonPath('unreadCount', 1)
        ->assertJsonCount(1, 'items')
        ->assertJsonPath('items.0.id', $notification->id)
        ->assertJsonPath('items.0.title', $notification->data['title'])
        ->assertJsonPath('items.0.message', $notification->data['message'])
        ->assertJsonPath('items.0.read', false)
        ->assertJsonPath('items.0.visit_url', route('notifications.visit', $notification->id));
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
