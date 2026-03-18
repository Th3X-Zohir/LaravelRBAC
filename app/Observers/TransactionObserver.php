<?php

namespace App\Observers;

use App\Models\Transaction;

class TransactionObserver
{
    /**
     * Handle the Transaction "updated" event.
     */
    public function updated(Transaction $transaction): void
    {
        if ($transaction->status !== 'completed' || ! $transaction->wasChanged('status')) {
            return;
        }

        $subscriber = $transaction->user;
        $plan = $transaction->plan;

        if ($subscriber->planSubscription('main')) {
            return;
        }

        $subscriber->newPlanSubscription('main', $plan);
    }
}
