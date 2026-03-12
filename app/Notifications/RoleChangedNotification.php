<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class RoleChangedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public string $previousRole,
        public string $newRole,
    ) {
        $this->afterCommit();
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array{title_key: string, message_key: string, replacements: array<string, scalar|null>, type: string, url: string}
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title_key' => 'app.notifications.role_changed_title',
            'message_key' => 'app.notifications.role_changed_message',
            'replacements' => [
                'previous_role' => $this->previousRole,
                'new_role' => $this->newRole,
            ],
            'type' => 'info',
            'url' => route('dashboard'),
        ];
    }
}
