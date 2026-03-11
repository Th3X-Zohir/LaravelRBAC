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
     * Get the array representation of the notification.
     *
     * @return array{title: string, message: string, type: string, url: string}
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Role Updated',
            'message' => sprintf(
                'Your access changed from %s to %s.',
                $this->formatRole($this->previousRole),
                $this->formatRole($this->newRole),
            ),
            'type' => 'info',
            'url' => route('dashboard'),
        ];
    }

    private function formatRole(string $role): string
    {
        return match ($role) {
            'cr' => 'CR',
            'superadmin' => 'Superadmin',
            default => 'Authenticated',
        };
    }
}
