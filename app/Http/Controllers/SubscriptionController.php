<?php

namespace App\Http\Controllers;

use App\Library\SslCommerz\SslCommerzNotification;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;
use Laravelcm\Subscriptions\Models\Plan;

class SubscriptionController extends Controller
{
    private $gateway;

    public function __construct()
    {
        $this->gateway = new SslCommerzNotification();
    }

    public function view(): Response
    {
        $plan = Plan::firstOrFail();

        return Inertia::render('subscribe/index', [
            'plan' => $plan,
            'csrf' => csrf_token(),
        ]);
    }

    public function subscribe()
    {
        $user = auth()->user();

        $plan = Plan::firstOrFail();

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

        $this->gateway->makePayment($data, 'hosted');
    }

    public function success(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tran_id' => 'required',
            'amount' => 'required',
            'currency' => 'required|max:3'
        ]);

        if ($validator->fails()) {
            return redirect()->route('subscribe.fail');
        }

        $validated = $validator->validated();

        $transaction = Transaction::findOrFail($validated['tran_id']);

        if ($transaction->status != 'pending') {
            return redirect()->route('subscribe.success');
        }

        $validation = $this->gateway->orderValidate($request->all(), $validated['tran_id'], $validated['amount'], $validated['amount']);
        if ($validation) {
            $transaction->status = 'completed';
            $transaction->save();
        }

        return redirect()->route('subscribe.success');
    }

    public function fail(Request $request)
    {
        $validated = $request->validate([
            'tran_id' => 'required',
        ]);

        $transaction = Transaction::findOrFail($validated['tran_id']);

        abort_if(!$transaction, 404);

        if ($transaction->status != 'pending') {
            return redirect()->route('subscribe.fail');
        }

        $transaction->status = 'failed';
        $transaction->save();

        return redirect()->route('subscribe.fail');
    }

    public function cancel(Request $request)
    {
        $validated = $request->validate([
            'tran_id' => 'required',
        ]);

        $transaction = Transaction::findOrFail($validated['tran_id']);

        abort_if(!$transaction, 404);

        if ($transaction->status != 'pending') {
            return redirect()->route('dashboard');
        }

        $transaction->status = 'failed';
        $transaction->save();

        return redirect()->route('subscribe.fail');
    }

    public function ipn(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tran_id' => 'required',
            'amount' => 'required',
            'currency' => 'required|max:3'
        ]);

        if ($validator->fails()) {
            return redirect()->route('subscribe.fail');
        }

        $validated = $validator->validated();

        $transaction = Transaction::findOrFail($validated['tran_id']);

        if ($transaction->status != 'pending') {
            logger('Transaction already processed');

            return "Transaction already processed";
        }

        $validation = $this->gateway->orderValidate($request->all(), $validated['tran_id'], $transaction->amount, $transaction->currency);

        if (!$validation) {
            logger('Transaction verification failed');
            $transaction->status = 'failed';
        } else {
            $transaction->status = 'completed';
        }

        $transaction->save();

        logger('Transaction completed successfully');
        return "OK";
    }
}
