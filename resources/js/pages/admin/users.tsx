import { Head, router } from '@inertiajs/react';
import { ShieldCheck, UserRound } from 'lucide-react';

import { updateRole as updateUserRole } from '@/actions/App/Http/Controllers/Admin/UserController';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/utils';

type UserRow = {
    id: number;
    name: string;
    email: string;
    roles: string[];
    created_at: string;
};

const roleLabels: Record<string, string> = {
    authenticated: 'Authenticated',
    cr: 'CR',
    superadmin: 'Superadmin',
};

export default function AdminUsers({ users }: { users: UserRow[] }) {
    function updateRole(userId: number, role: string): void {
        router.patch(
            updateUserRole.url(userId),
            { role },
            { preserveScroll: true },
        );
    }

    return (
        <AppLayout>
            <Head title="Manage Users" />

            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">
                        Manage Users
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Promote users to CR or superadmin, or return them to the
                        default authenticated role. Users are notified whenever
                        their role changes.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>User Roles</CardTitle>
                        <CardDescription>
                            Superadmin-only role management for all registered
                            DIU accounts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Current Role</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead>Assign Role</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => {
                                    const currentRole =
                                        user.roles[0] ?? 'authenticated';

                                    return (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                                                        <UserRound className="size-4 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {user.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        currentRole ===
                                                        'superadmin'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    <ShieldCheck className="size-3" />
                                                    {roleLabels[currentRole]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {formatDate(user.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={currentRole}
                                                    onValueChange={(value) =>
                                                        updateRole(
                                                            user.id,
                                                            value ??
                                                                currentRole,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="w-[170px]">
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="authenticated">
                                                            Authenticated
                                                        </SelectItem>
                                                        <SelectItem value="cr">
                                                            CR
                                                        </SelectItem>
                                                        <SelectItem value="superadmin">
                                                            Superadmin
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
