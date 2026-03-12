<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the user's dashboard.
     */
    public function index(Request $request, DashboardService $dashboardService): Response
    {
        $user = $request->user();

        return Inertia::render('dashboard', [
            'stats' => $dashboardService->getUserStats($user),
            'recentRequests' => $dashboardService->getRecentRequestsForUser($user),
            'pendingRequests' => $user->hasRole('superadmin')
                ? $dashboardService->getPendingRequestsForAdmin()
                : [],
        ]);
    }
}
