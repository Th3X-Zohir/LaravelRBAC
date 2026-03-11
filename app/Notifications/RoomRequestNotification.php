<?php

namespace App\Notifications;

use App\Models\RoomRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class RoomRequestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public RoomRequest $roomRequest,
        public string $action = 'created',
    ) {
        $this->afterCommit();
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array{title: string, message: string, type: string, action: string, audience: string, room_request_id: int, url: string}
     */
    public function toArray(object $notifiable): array
    {
        $room = $this->roomRequest->room;
        $user = $this->roomRequest->user;

        return match ($this->action) {
            'created' => [
                'title' => 'New Room Request',
                'message' => "{$user->name} requested room {$room->room_number} on {$this->roomRequest->date->format('M d, Y')}.",
                'type' => 'info',
                'action' => 'created',
                'audience' => 'admin',
                'room_request_id' => $this->roomRequest->id,
                'url' => route('admin.requests.show', $this->roomRequest),
            ],
            'approved' => [
                'title' => 'Room Request Approved',
                'message' => "Your request for room {$room->room_number} on {$this->roomRequest->date->format('M d, Y')} has been approved.",
                'type' => 'approved',
                'action' => 'approved',
                'audience' => 'requester',
                'room_request_id' => $this->roomRequest->id,
                'url' => route('requests.show', $this->roomRequest),
            ],
            'rejected' => [
                'title' => 'Room Request Rejected',
                'message' => "Your request for room {$room->room_number} on {$this->roomRequest->date->format('M d, Y')} has been rejected.",
                'type' => 'rejected',
                'action' => 'rejected',
                'audience' => 'requester',
                'room_request_id' => $this->roomRequest->id,
                'url' => route('requests.show', $this->roomRequest),
            ],
            default => [
                'title' => 'Room Request Update',
                'message' => "Room request for {$room->room_number} has been updated.",
                'type' => 'info',
                'action' => 'updated',
                'audience' => 'requester',
                'room_request_id' => $this->roomRequest->id,
                'url' => route('requests.show', $this->roomRequest),
            ],
        };
    }
}
