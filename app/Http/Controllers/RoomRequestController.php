<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoomRequestRequest;
use App\Models\RoomRequest;
use App\Models\User;
use App\Notifications\RoomRequestNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
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
        if ($roomRequest->user_id !== $request->user()->id) {
            abort(403, 'You can only view your own requests.');
        }

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
            ->with('success', 'Room request submitted successfully.');
    }

    /**
     * Cancel a pending room request (own request only).
     */
    public function cancel(Request $request, RoomRequest $roomRequest): RedirectResponse
    {
        if ($roomRequest->user_id !== $request->user()->id) {
            abort(403, 'You can only cancel your own requests.');
        }

        if ($roomRequest->status !== 'pending') {
            return back()->withErrors(['status' => 'Only pending requests can be cancelled.']);
        }

        $roomRequest->delete();

        return back()->with('success', 'Room request cancelled.');
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
    public function approve(Request $request, RoomRequest $roomRequest): RedirectResponse
    {
        try {
            [$approvedRequest, $autoRejectedRequests] = DB::transaction(function () use ($request, $roomRequest): array {
                $lockedRequest = RoomRequest::query()
                    ->with(['room', 'user'])
                    ->lockForUpdate()
                    ->findOrFail($roomRequest->id);

                if ($lockedRequest->status !== 'pending') {
                    throw ValidationException::withMessages([
                        'status' => 'Only pending requests can be approved.',
                    ]);
                }

                $overlappingRequests = RoomRequest::query()
                    ->with(['room', 'user'])
                    ->where('room_id', $lockedRequest->room_id)
                    ->whereDate('date', $lockedRequest->date->toDateString())
                    ->whereIn('status', ['pending', 'approved'])
                    ->overlapping($lockedRequest->start_time, $lockedRequest->end_time)
                    ->lockForUpdate()
                    ->get();

                $hasConflict = $overlappingRequests
                    ->where('status', 'approved')
                    ->where('id', '!=', $lockedRequest->id)
                    ->isNotEmpty();

                if ($hasConflict) {
                    throw ValidationException::withMessages([
                        'status' => 'This time slot has already been approved for that room and date.',
                    ]);
                }

                $reviewedAt = now();

                $lockedRequest->forceFill([
                    'status' => 'approved',
                    'reviewed_by' => $request->user()->id,
                    'reviewed_at' => $reviewedAt,
                ])->save();

                $autoRejectedRequests = $overlappingRequests
                    ->where('status', 'pending')
                    ->where('id', '!=', $lockedRequest->id)
                    ->values();

                $autoRejectedRequests->each(function (RoomRequest $pendingRequest) use ($request, $reviewedAt): void {
                    $pendingRequest->forceFill([
                        'status' => 'rejected',
                        'reviewed_by' => $request->user()->id,
                        'reviewed_at' => $reviewedAt,
                    ])->save();
                });

                $refreshedAutoRejectedRequests = RoomRequest::query()
                    ->with(['room', 'user'])
                    ->whereKey($autoRejectedRequests->modelKeys())
                    ->get();

                return [$lockedRequest->fresh(['room', 'user']), $refreshedAutoRejectedRequests];
            });
        } catch (ValidationException $exception) {
            return back()->withErrors($exception->errors());
        }

        $approvedRequest->user->notify(new RoomRequestNotification($approvedRequest, 'approved'));
        $this->sendAutoRejectedNotifications($autoRejectedRequests);

        return back()->with('success', 'Room request approved.');
    }

    /**
     * Reject a room request (superadmin only).
     */
    public function reject(Request $request, RoomRequest $roomRequest): RedirectResponse
    {
        if ($roomRequest->status !== 'pending') {
            return back()->withErrors(['status' => 'Only pending requests can be rejected.']);
        }

        $roomRequest->update([
            'status' => 'rejected',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $roomRequest->load(['room', 'user']);

        $roomRequest->user->notify(new RoomRequestNotification($roomRequest, 'rejected'));

        return back()->with('success', 'Room request rejected.');
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
