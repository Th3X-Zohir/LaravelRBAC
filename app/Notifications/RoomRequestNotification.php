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
        $date = $this->roomRequest->date->format('M d, Y');

        return match ($this->action) {
            'created' => [
                'title' => __('app.notifications.new_request_title'),
                'message' => __('app.notifications.new_request_message', [
                    'user' => $user->name,
                    'room' => $room->room_number,
                    'date' => $date,
                ]),
                'type' => 'info',
                'action' => 'created',
                'audience' => 'admin',
                'room_request_id' => $this->roomRequest->id,
                'url' => route('admin.requests.show', $this->roomRequest),
            ],
            'approved' => [
                'title' => __('app.notifications.approved_title'),
                'message' => __('app.notifications.approved_message', [
                    'room' => $room->room_number,
                    'date' => $date,
                ]),
                'type' => 'approved',
                'action' => 'approved',
                'audience' => 'requester',
                'room_request_id' => $this->roomRequest->id,
                'url' => route('requests.show', $this->roomRequest),
            ],
            'rejected' => [
                'title' => __('app.notifications.rejected_title'),
                'message' => __('app.notifications.rejected_message', [
                    'room' => $room->room_number,
                    'date' => $date,
                ]),
                'type' => 'rejected',
                'action' => 'rejected',
                'audience' => 'requester',
                'room_request_id' => $this->roomRequest->id,
                'url' => route('requests.show', $this->roomRequest),
            ],
            default => [
                'title' => __('app.notifications.updated_title'),
                'message' => __('app.notifications.updated_message', [
                    'room' => $room->room_number,
                ]),
                'type' => 'info',
                'action' => 'updated',
                'audience' => 'requester',
                'room_request_id' => $this->roomRequest->id,
                'url' => route('requests.show', $this->roomRequest),
            ],
        };
    }
}
