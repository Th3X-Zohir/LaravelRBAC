<?php

namespace App\Http\Controllers;

use App\Models\RoomRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    /**
     * List notifications for the authenticated user (JSON).
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->limit(30)
            ->get()
            ->map(fn ($notification) => $this->transformNotification($notification));

        return response()->json($notifications);
    }

    /**
     * Mark a notification as read and redirect to its target page.
     */
    public function visit(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        $notification->markAsRead();

        return redirect()->to($this->resolveTargetUrl($request, $notification));
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        $notification->markAsRead();

        return back(303);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return back(303);
    }

    /**
     * @return array{id: string, title: string, message: string, type: string, read: bool, time: string, created_at: string, visit_url: string}
     */
    private function transformNotification(object $notification): array
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

    private function resolveTargetUrl(Request $request, DatabaseNotification $notification): string
    {
        $data = $notification->data;
        $roomRequestId = $data['room_request_id'] ?? null;

        if (is_numeric($roomRequestId)) {
            $roomRequest = RoomRequest::query()->find($roomRequestId);

            if ($roomRequest !== null) {
                $audience = $data['audience'] ?? null;
                $action = $data['action'] ?? null;

                if ($audience === 'admin' || $action === 'created') {
                    return route('admin.requests.show', $roomRequest);
                }

                return route('requests.show', $roomRequest);
            }

            if (($data['audience'] ?? null) === 'admin' || ($data['action'] ?? null) === 'created') {
                return route('admin.requests.index');
            }

            return route('requests.index');
        }

        return $data['url'] ?? route('dashboard');
    }
}
