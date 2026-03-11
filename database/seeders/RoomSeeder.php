<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    /**
     * Seed university classroom rooms.
     */
    public function run(): void
    {
        $rooms = [
            '201', '202', '203', '204', '205',
            '206', '207', '208', '208(A)', '209',
            '210', '211', '212', '301', '302',
            '303', '304', '305', '306', '307',
        ];

        foreach ($rooms as $roomNumber) {
            Room::create([
                'room_number' => $roomNumber,
                'status' => 'available',
            ]);
        }
    }
}
