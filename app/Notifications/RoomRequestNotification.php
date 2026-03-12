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
     * @return array{title_key: string, message_key: string, replacements: array<string, scalar|null>, type: string, action: string, audience: string, room_request_id: int, url: string}
     */
    public function toArray(object $notifiable): array
    {
        $room = $this->roomRequest->room;
        $user = $this->roomRequest->user;
        $date = $this->roomRequest->date->toDateString();

        return match ($this->action) {
            'created' => [
                'title_key' => 'app.notifications.new_request_title',
                'message_key' => 'app.notifications.new_request_message',
                'replacements' => [
                    'user' => $user->name,
                    'room' => $room->room_number,
                    'date' => $date,
                ],
                'type' => 'info',
                'action' => 'created',
                'audience' => 'admin',
                'room_request_id' => $this->roomRequest->id,
                'url' => route('admin.requests.show', $this->roomRequest),
            ],
            'approved' => [
                'title_key' => 'app.notifications.approved_title',
                'message_key' => 'app.notifications.approved_message',
                'replacements' => [
                    'room' => $room->room_number,
                    'date' => $date,
                ],
                'type' => 'approved',
                'action' => 'approved',
                'audience' => 'requester',
                'room_request_id' => $this->roomRequest->id,
                'url' => route('requests.show', $this->roomRequest),
            ],
            'rejected' => [
                'title_key' => 'app.notifications.rejected_title',
                'message_key' => 'app.notifications.rejected_message',
                'replacements' => [
                    'room' => $room->room_number,
                    'date' => $date,
                ],
                'type' => 'rejected',
                'action' => 'rejected',
                'audience' => 'requester',
                'room_request_id' => $this->roomRequest->id,
                'url' => route('requests.show', $this->roomRequest),
            ],
            default => [
                'title_key' => 'app.notifications.updated_title',
                'message_key' => 'app.notifications.updated_message',
                'replacements' => [
                    'room' => $room->room_number,
                ],
                'type' => 'info',
                'action' => 'updated',
                'audience' => 'requester',
                'room_request_id' => $this->roomRequest->id,
                'url' => route('requests.show', $this->roomRequest),
            ],
        };
    }
}
