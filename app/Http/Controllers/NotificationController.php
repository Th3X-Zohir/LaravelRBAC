<?php

namespace App\Http\Controllers;

use App\Models\RoomRequest;
use App\Notifications\NotificationData;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    /**
     * List notifications for the authenticated user (JSON).
     */
    public function index(Request $request): JsonResponse
    {
        return response()->json(NotificationData::forUser($request->user()));
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
    public function markAsRead(Request $request, string $id): Response|RedirectResponse
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        $notification->markAsRead();

        if ($request->expectsJson()) {
            return response()->noContent();
        }

        return back(303);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): Response|RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        if ($request->expectsJson()) {
            return response()->noContent();
        }

        return back(303);
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
