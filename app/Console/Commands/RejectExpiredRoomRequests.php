<?php

namespace App\Console\Commands;

use App\Models\RoomRequest;
use Illuminate\Console\Command;

class RejectExpiredRoomRequests extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'requests:reject-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reject pending room requests whose booking date is already in the past';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $rejectedCount = RoomRequest::query()
            ->where('status', 'pending')
            ->whereDate('date', '<', today()->toDateString())
            ->update([
                'status' => 'rejected',
                'reviewed_at' => now(),
            ]);

        $this->info("Rejected {$rejectedCount} expired pending room request(s).");

        return self::SUCCESS;
    }
}
