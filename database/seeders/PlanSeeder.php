<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Laravelcm\Subscriptions\Interval;
use Laravelcm\Subscriptions\Models\Plan;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plan = Plan::create([
            'name' => 'Pro',
            'description' => 'Pro plan',
            'price' => 1200,
            'invoice_period' => 1,
            'invoice_interval' => Interval::MONTH->value,
            'sort_order' => 1,
            'currency' => 'BDT',
        ]);
    }
}
