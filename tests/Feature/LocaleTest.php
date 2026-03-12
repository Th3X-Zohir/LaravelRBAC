<?php

use Inertia\Testing\AssertableInertia as Assert;

it('allows guests to change the application locale', function () {
    $this->from(route('login'))
        ->post(route('locale.update'), [
            'locale' => 'bn',
        ])
        ->assertRedirect(route('login'))
        ->assertSessionHas('locale', 'bn');
});

it('shares translated content for guests after switching locale', function () {
    $this->withSession(['locale' => 'bn'])
        ->get(route('login'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/login')
            ->where('locale', 'bn')
            ->where('translations.auth.welcome_back', 'আবার স্বাগতম'));
});
