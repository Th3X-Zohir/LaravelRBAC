<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('auth/register');
    }

    public function __invoke(RegisterRequest $request): RedirectResponse
    {
        $user = User::create($request->validated());
        $user->assignRole('authenticated');

        Auth::login($user);

        return redirect()->intended(route('dashboard'));
    }
}
