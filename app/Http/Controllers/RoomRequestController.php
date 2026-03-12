<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApproveRoomRequestRequest;
use App\Http\Requests\CancelRoomRequestRequest;
use App\Http\Requests\RejectRoomRequestRequest;
use App\Http\Requests\StoreRoomRequestRequest;
use App\Models\RoomRequest;
use App\Services\RoomService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
    public function store(StoreRoomRequestRequest $request, RoomService $roomService): RedirectResponse
    {
        $roomService->createRequest($request->user(), $request->validated());

        return redirect()->route('requests.index')
            ->with('success', __('app.flash.room_request_submitted'));
    }

    /**
     * Cancel a pending room request (own request only).
     */
    public function cancel(CancelRoomRequestRequest $request, RoomRequest $roomRequest, RoomService $roomService): RedirectResponse
    {
        $roomService->cancelRequest($roomRequest);

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
    public function approve(ApproveRoomRequestRequest $request, RoomRequest $roomRequest, RoomService $roomService): RedirectResponse
    {
        try {
            $roomService->approveRequest($request->user(), $roomRequest);
        } catch (ValidationException $exception) {
            return back()->withErrors($exception->errors());
        }

        return back()->with('success', __('app.flash.room_request_approved'));
    }

    /**
     * Reject a room request (superadmin only).
     */
    public function reject(RejectRoomRequestRequest $request, RoomRequest $roomRequest, RoomService $roomService): RedirectResponse
    {
        $roomService->rejectRequest($request->user(), $roomRequest);

        return back()->with('success', __('app.flash.room_request_rejected'));
    }
}
