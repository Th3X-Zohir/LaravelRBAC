<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\RoomRequestController;
use Illuminate\Support\Facades\Route;

// ── Guest (auth) routes ─────────────────────────────────────────
Route::middleware('guest')->group(function (): void {
    Route::get('/login', [LoginController::class, 'show'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);

    Route::get('/register', [RegisterController::class, 'show'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);
});

Route::post('/locale', LocaleController::class)->name('locale.update');

Route::redirect('/', '/rooms');

// Public: browse room availability (no auth required)
Route::prefix('rooms')->name('rooms.')->group(function (): void {
    Route::get('/', [RoomController::class, 'index'])->name('index');
    Route::get('/search', [RoomController::class, 'search'])->name('search');
    Route::get('/{room}/slots', [RoomController::class, 'slots'])->name('slots');
});

// ── Authenticated routes ────────────────────────────────────────
Route::middleware('auth')->group(function (): void {
    Route::post('/logout', LogoutController::class)->name('logout');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/requests', [RoomRequestController::class, 'index'])->name('requests.index');
    Route::get('/requests/{roomRequest}', [RoomRequestController::class, 'show'])->name('requests.show');

    // Room request actions (authorization: store via FormRequest; show/cancel/approve/reject via Policy + FormRequest)
    Route::post('/requests', [RoomRequestController::class, 'store'])->name('requests.store');
    Route::delete('/requests/{roomRequest}', [RoomRequestController::class, 'cancel'])->name('requests.cancel');

    // ── Notification routes ─────────────────────────────────
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/{id}/visit', [NotificationController::class, 'visit'])->name('notifications.visit');
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    // ── Admin routes (superadmin only) ──────────────────────
    Route::middleware('role:superadmin')->prefix('admin')->name('admin.')->group(function (): void {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::patch('/users/{user}/role', [UserController::class, 'updateRole'])->name('users.update-role');

        Route::get('/requests', [RoomRequestController::class, 'adminIndex'])->name('requests.index');
        Route::get('/requests/{roomRequest}', [RoomRequestController::class, 'adminShow'])->name('requests.show');
        Route::patch('/requests/{roomRequest}/approve', [RoomRequestController::class, 'approve'])->name('requests.approve');
        Route::patch('/requests/{roomRequest}/reject', [RoomRequestController::class, 'reject'])->name('requests.reject');
    });
});
