<?php

namespace App\Notifications;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Notifications\DatabaseNotification;

class NotificationData
{
    /**
     * @return array{unreadCount: int, items: list<array{id: string, title: string, message: string, type: string, read: bool, time: string, created_at: string, visit_url: string}>}
     */
    public static function forUser(?Authenticatable $user): array
    {
        if ($user === null) {
            return ['unreadCount' => 0, 'items' => []];
        }

        return [
            'unreadCount' => $user->unreadNotifications()->count(),
            'items' => $user->notifications()
                ->latest()
                ->limit(30)
                ->get()
                ->map(fn (DatabaseNotification $notification) => self::item($notification))
                ->all(),
        ];
    }

    /**
     * @return array{id: string, title: string, message: string, type: string, read: bool, time: string, created_at: string, visit_url: string}
     */
    public static function item(DatabaseNotification $notification): array
    {
        return [
            'id' => $notification->id,
            'title' => $notification->data['title'] ?? '',
            'message' => $notification->data['message'] ?? '',
            'type' => $notification->data['type'] ?? 'info',
            'read' => $notification->read_at !== null,
            'time' => $notification->created_at->diffForHumans(),
            'created_at' => $notification->created_at->toISOString(),
            'visit_url' => route('notifications.visit', $notification->id),
        ];
    }
}
