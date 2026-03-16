<?php

namespace App\Http\Controllers;

use App\Library\SslCommerz\SslCommerzNotification;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravelcm\Subscriptions\Models\Plan;

class SubscriptionController extends Controller
{
    public function view(): Response
    {
        $plan = Plan::first();

        return Inertia::render('subscribe/index', [
            'plan' => $plan,
            'csrf' => csrf_token(),
        ]);
    }

    public function subscribe()
    {
        $user = auth()->user();

        if ($user->planSubscription('main')) {
            return redirect()->route('dashboard');
        }

        $plan = Plan::first();

        $transaction = Transaction::create([
            'user_id' => $user->id,
            'status' => 'pending',
            'plan_id' => $plan->id,
            'currency' => $plan->currency,
            'amount' => $plan->price,
        ]);

        $data = [
            'total_amount' => $plan->price,
            'currency' => $plan->currency,
            'tran_id' => $transaction->id,
            'cus_name' => $user->name,
            'cus_email' => $user->email,
            'cus_add1' => 'Test Address',
            'cus_country' => 'Bangladesh',
            'shipping_method' => 'NO',
            'product_name' => 'Computer',
            'product_category' => 'Goods',
            'product_profile' => 'physical-goods',
        ];

        $sslc = new SslCommerzNotification;
        $payment_options = $sslc->makePayment($data, 'hosted');

        dd($payment_options);

        if (! is_array($payment_options)) {
            print_r($payment_options);
            $payment_options = [];
        }
    }

    public function success(Request $request)
    {
        $tran_id = $request->input('tran_id');
        $amount = $request->input('amount');
        $currency = $request->input('currency');

        $transaction = Transaction::find($tran_id);
        if (! $transaction) {
            return Inertia::render('subscribe/failed');
        }

        if ($transaction->status != 'pending') {
            return Inertia::render('subscribe/success');
        }

        $sslc = new SslCommerzNotification;
        $validation = $sslc->orderValidate($request->all(), $tran_id, $amount, $currency);
        if (! $validation) {
            return Inertia::render('subscribe/failed');
        }

        $transaction->status = 'completed';
        $transaction->save();

        return Inertia::render('subscribe/success');
    }

    public function fail(Request $request)
    {
        $tran_id = $request->input('tran_id');

        $transaction = Transaction::find($tran_id);

        abort_if(! $transaction, 404);

        if ($transaction->status != 'pending') {
            return redirect()->route('subscribe.fail');
        }

        $transaction->status = 'failed';
        $transaction->save();

        return Inertia::render('subscribe/failed');
    }

    public function cancel(Request $request)
    {
        $tran_id = $request->input('tran_id');

        $transaction = Transaction::find($tran_id);

        abort_if(! $transaction, 404);

        if ($transaction->status != 'pending') {
            return redirect()->route('dashboard');
        }

        $transaction->status = 'failed';
        $transaction->save();

        return Inertia::render('subscribe/cancel');
    }

    public function ipn(Request $request)
    {
        if (! $request->input('tran_id')) {
            echo 'Transaction ID is missing';

            return;
        }

        $tran_id = $request->input('tran_id');
        $transaction = Transaction::find($tran_id);

        if (! $transaction) {
            echo 'Transaction not found';

            return;
        }

        if ($transaction->status != 'pending') {
            echo 'Transaction already processed';

            return;
        }

        $sslc = new SslCommerzNotification;
        $validation = $sslc->orderValidate($request->all(), $tran_id, $transaction->amount, $transaction->currency);

        if (! $validation) {
            echo 'Transaction verification failed';

            return;
        }

        $transaction->status = 'completed';
        $transaction->save();
        echo 'Transaction completed successfully';
    }
}
