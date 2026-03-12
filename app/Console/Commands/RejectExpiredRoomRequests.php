<?php

namespace App\Console\Commands;

use App\Services\RoomService;
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
    public function handle(RoomService $roomService): int
    {
        $rejectedCount = $roomService->rejectExpiredRequests();

        $this->info("Rejected {$rejectedCount} expired pending room request(s).");

        return self::SUCCESS;
    }
}
