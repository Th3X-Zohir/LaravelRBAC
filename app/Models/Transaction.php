<?php

namespace App\Models;

use App\Observers\TransactionObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Laravelcm\Subscriptions\Models\Plan;

#[ObservedBy([TransactionObserver::class])]
class Transaction extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'status',
        'plan_id',
        'currency',
        'amount',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function plan(): HasOne
    {
        return $this->hasOne(Plan::class, 'id', 'plan_id');
    }
}
