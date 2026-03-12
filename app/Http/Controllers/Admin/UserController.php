<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRoleRequest;
use App\Models\User;
use App\Notifications\RoleChangedNotification;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * List all users with their roles for superadmin management.
     */
    public function index(): Response
    {
        $users = User::query()
            ->with('roles')
            ->latest()
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames()->toArray(),
                'created_at' => $user->created_at->toISOString(),
            ]);

        return Inertia::render('admin/users', [
            'users' => $users,
        ]);
    }

    /**
     * Update a user's role.
     */
    public function updateRole(UpdateUserRoleRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();
        $currentRole = $user->getRoleNames()->first() ?? 'authenticated';
        $newRole = $validated['role'];

        if ($currentRole === $newRole) {
            return back()->with('success', __('app.flash.role_already_set', [
                'name' => $user->name,
                'role' => $newRole,
            ]));
        }

        $user->syncRoles([$newRole]);
        $user->notify(new RoleChangedNotification($currentRole, $newRole));

        return back()->with('success', __('app.flash.role_updated', [
            'name' => $user->name,
            'role' => $newRole,
        ]));
    }
}
