<?php

namespace App\Notifications;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Carbon;
use IntlDateFormatter;

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
        $data = $notification->data;

        return [
            'id' => $notification->id,
            'title' => self::translateField($data, 'title'),
            'message' => self::translateField($data, 'message'),
            'type' => $data['type'] ?? 'info',
            'read' => $notification->read_at !== null,
            'time' => $notification->created_at->locale(app()->getLocale())->diffForHumans(),
            'created_at' => $notification->created_at->toISOString(),
            'visit_url' => route('notifications.visit', $notification->id),
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private static function translateField(array $data, string $field): string
    {
        $rawValue = $data[$field] ?? null;

        if (is_string($rawValue)) {
            return $rawValue;
        }

        $translationKey = $data["{$field}_key"] ?? null;

        if (! is_string($translationKey)) {
            return '';
        }

        $replacements = $data['replacements'] ?? [];

        return __($translationKey, self::resolveReplacements(is_array($replacements) ? $replacements : []));
    }

    /**
     * @param  array<string, mixed>  $replacements
     * @return array<string, scalar|null>
     */
    private static function resolveReplacements(array $replacements): array
    {
        $resolved = [];

        foreach ($replacements as $key => $value) {
            $resolved[$key] = self::resolveReplacementValue($key, $value);
        }

        return $resolved;
    }

    private static function resolveReplacementValue(string $key, mixed $value): string|int|float|bool|null
    {
        if (! is_scalar($value) && $value !== null) {
            return null;
        }

        if (! is_string($value)) {
            return $value;
        }

        if ($key === 'date') {
            return self::formatDate($value);
        }

        if ($key === 'previous_role' || $key === 'new_role') {
            return __("app.roles.{$value}");
        }

        return $value;
    }

    private static function formatDate(string $value): string
    {
        $date = Carbon::parse($value)->startOfDay();
        $formatter = new IntlDateFormatter(
            self::intlLocale(),
            IntlDateFormatter::MEDIUM,
            IntlDateFormatter::NONE,
            config('app.timezone'),
            IntlDateFormatter::GREGORIAN,
            'MMM d, yyyy',
        );

        $formatted = $formatter->format($date->getTimestamp());

        if (is_string($formatted)) {
            return $formatted;
        }

        return $date->locale(app()->getLocale())->translatedFormat('M j, Y');
    }

    private static function intlLocale(): string
    {
        return app()->getLocale() === 'bn' ? 'bn_BD' : 'en_US';
    }
}
