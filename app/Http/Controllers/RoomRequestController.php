<?php

namespace App\Http\Controllers;

use App\Actions\ApproveRoomRequest;
use App\Http\Requests\ApproveRoomRequestRequest;
use App\Http\Requests\CancelRoomRequestRequest;
use App\Http\Requests\RejectRoomRequestRequest;
use App\Http\Requests\StoreRoomRequestRequest;
use App\Models\RoomRequest;
use App\Models\User;
use App\Notifications\RoomRequestNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RoomRequestController extends Controller
{
    /**
     * List the authenticated user's room requests.
     */
    public function index(Request $request): Response
    {
        $requests = RoomRequest::query()
            ->with(['room', 'reviewer'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return Inertia::render('requests/index', [
            'roomRequests' => $requests,
        ]);
    }

    /**
     * Show a single room request for its owner.
     */
    public function show(Request $request, RoomRequest $roomRequest): Response
    {
        $this->authorize('view', $roomRequest);

        $roomRequest->load(['room', 'user', 'reviewer']);

        return Inertia::render('requests/show', [
            'roomRequest' => $roomRequest,
        ]);
    }

    /**
     * Store a new room booking request (cr role only).
     */
    public function store(StoreRoomRequestRequest $request): RedirectResponse
    {
        $roomRequest = RoomRequest::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'status' => 'pending',
        ]);

        $roomRequest->load(['room', 'user']);

        $superadmins = User::role('superadmin')->get();
        Notification::send($superadmins, new RoomRequestNotification($roomRequest, 'created'));

        return redirect()->route('requests.index')
            ->with('success', __('app.flash.room_request_submitted'));
    }

    /**
     * Cancel a pending room request (own request only).
     */
    public function cancel(CancelRoomRequestRequest $request, RoomRequest $roomRequest): RedirectResponse
    {
        $roomRequest->delete();

        return back()->with('success', __('app.flash.room_request_cancelled'));
    }

    /**
     * List all room requests for superadmin review.
     */
    public function adminIndex(): Response
    {
        $requests = RoomRequest::query()
            ->with(['room', 'user', 'reviewer'])
            ->latest()
            ->get();

        return Inertia::render('admin/requests', [
            'roomRequests' => $requests,
        ]);
    }

    /**
     * Show a single room request for superadmin review.
     */
    public function adminShow(RoomRequest $roomRequest): Response
    {
        $roomRequest->load(['room', 'user', 'reviewer']);

        return Inertia::render('admin/requests/show', [
            'roomRequest' => $roomRequest,
        ]);
    }

    /**
     * Approve a room request (superadmin only).
     */
    public function approve(ApproveRoomRequestRequest $request, RoomRequest $roomRequest): RedirectResponse
    {
        try {
            [$approvedRequest, $autoRejectedRequests] = app(ApproveRoomRequest::class)(
                $request->user(),
                $roomRequest,
            );
        } catch (ValidationException $exception) {
            return back()->withErrors($exception->errors());
        }

        $approvedRequest->user->notify(new RoomRequestNotification($approvedRequest, 'approved'));
        $this->sendAutoRejectedNotifications($autoRejectedRequests);

        return back()->with('success', __('app.flash.room_request_approved'));
    }

    /**
     * Reject a room request (superadmin only).
     */
    public function reject(RejectRoomRequestRequest $request, RoomRequest $roomRequest): RedirectResponse
    {
        $roomRequest->update([
            'status' => 'rejected',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $roomRequest->load(['room', 'user']);

        $roomRequest->user->notify(new RoomRequestNotification($roomRequest, 'rejected'));

        return back()->with('success', __('app.flash.room_request_rejected'));
    }

    /**
     * @param  Collection<int, RoomRequest>  $autoRejectedRequests
     */
    private function sendAutoRejectedNotifications(Collection $autoRejectedRequests): void
    {
        $autoRejectedRequests->each(function (RoomRequest $roomRequest): void {
            $roomRequest->loadMissing(['room', 'user']);
            $roomRequest->user->notify(new RoomRequestNotification($roomRequest, 'rejected'));
        });
    }
}
