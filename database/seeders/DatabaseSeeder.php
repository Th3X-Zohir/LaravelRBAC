<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleSeeder::class);

        // Create the default superadmin user
        $superadmin = User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'superadmin@diu.edu.bd',
            'password' => 'abcd1234',
        ]);
        $superadmin->assignRole('superadmin');

        // Create a test CR user
        $cr = User::factory()->create([
            'name' => 'Test CR',
            'email' => 'cr@diu.edu.bd',
            'password' => 'abcd1234',
        ]);
        $cr->assignRole('cr');

        // Create a test authenticated user
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'user@diu.edu.bd',
            'password' => 'abcd1234',
        ]);
        $user->assignRole('authenticated');

        $this->call(RoomSeeder::class);

        $this->call(PlanSeeder::class);
    }
}
