<?php

use App\Models\Transaction;
use App\Models\User;
use Laravelcm\Subscriptions\Interval;
use Laravelcm\Subscriptions\Models\Plan;

it('creates a plan subscription when a transaction completes', function () {
    $plan = Plan::create([
        'name' => 'Pro',
        'description' => 'Pro plan',
        'price' => 1200,
        'invoice_period' => 1,
        'invoice_interval' => Interval::MONTH->value,
        'sort_order' => 1,
        'currency' => 'BDT',
    ]);

    $user = User::factory()->create();

    $transaction = Transaction::create([
        'user_id' => $user->id,
        'status' => 'pending',
        'plan_id' => $plan->id,
        'currency' => $plan->currency,
        'amount' => $plan->price,
    ]);

    $transaction->status = 'completed';
    $transaction->save();

    $subscription = $user->fresh()->planSubscription('main');

    expect($subscription)
        ->not->toBeNull()
        ->and($subscription->plan_id)->toBe($plan->id);
});
