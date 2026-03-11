<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Seed roles and permissions for the application.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'view rooms',
            'request room',
            'cancel own request',
            'approve request',
            'reject request',
            'manage users',
            'manage rooms',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }

        // Create roles and assign permissions
        Role::findOrCreate('authenticated')
            ->givePermissionTo(['view rooms']);

        Role::findOrCreate('cr')
            ->givePermissionTo(['view rooms', 'request room', 'cancel own request']);

        Role::findOrCreate('superadmin')
            ->givePermissionTo(Permission::all());
    }
}
