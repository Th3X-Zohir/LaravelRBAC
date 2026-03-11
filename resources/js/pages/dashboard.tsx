import { Head, Link, usePage } from '@inertiajs/react';
import {
    CalendarCheck,
    CalendarClock,
    ClipboardCheck,
    DoorClosed,
    DoorOpen,
    Search,
    ShieldCheck,
    Users,
} from 'lucide-react';

import { index as roomsIndex } from '@/actions/App/Http/Controllers/RoomController';
import { adminIndex as adminRequestsIndex } from '@/actions/App/Http/Controllers/RoomRequestController';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatDate, formatTime } from '@/lib/utils';
import type { Auth } from '@/types';

type Stats = {
    total_rooms: number;
    available_rooms: number;
    occupied_rooms: number;
    maintenance_rooms: number;
    my_pending_requests: number;
    my_approved_requests: number;
    my_total_requests: number;
    pending_approvals: number | null;
    total_users: number | null;
};

type RecentRequest = {
    id: number;
    date: string;
    start_time: string;
    end_time: string;
    purpose: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    room: {
        id: number;
        room_number: string;
        status: 'available' | 'occupied' | 'maintenance';
    };
    reviewer: {
        id: number;
        name: string;
        email: string;
    } | null;
};

type PendingRequest = {
    id: number;
    date: string;
    start_time: string;
    end_time: string;
    purpose: string;
    created_at: string;
    room: {
        id: number;
        room_number: string;
    };
    user: {
        id: number;
        name: string;
        email: string;
    };
};

const statusConfig = {
    pending: { variant: 'secondary' as const, label: 'Pending' },
    approved: { variant: 'default' as const, label: 'Approved' },
    rejected: { variant: 'destructive' as const, label: 'Rejected' },
};

export default function Dashboard({
    stats,
    recentRequests,
    pendingRequests,
}: {
    stats: Stats;
    recentRequests: RecentRequest[];
    pendingRequests: PendingRequest[];
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const roles = auth.user?.roles ?? [];
    const isSuperadmin = roles.includes('superadmin');
    const isCr = roles.includes('cr');

    const primaryStats = [
        {
            label: 'Available Rooms',
            value: stats.available_rooms,
            icon: DoorOpen,
            description: 'Ready for new classroom requests',
        },
        {
            label: 'Total Rooms',
            value: stats.total_rooms,
            icon: Search,
            description: 'Published in the availability directory',
        },
        {
            label: 'My Pending Requests',
            value: stats.my_pending_requests,
            icon: CalendarClock,
            description: 'Awaiting superadmin review',
        },
        {
            label: 'My Approved Requests',
            value: stats.my_approved_requests,
            icon: CalendarCheck,
            description: 'Approved classroom requests',
        },
    ];

    const adminStats = [
        {
            label: 'Pending Approvals',
            value: stats.pending_approvals ?? 0,
            icon: ClipboardCheck,
            description: 'Requests waiting in the admin queue',
        },
        {
            label: 'Total Users',
            value: stats.total_users ?? 0,
            icon: Users,
            description: 'Registered DIU users',
        },
        {
            label: 'Occupied Rooms',
            value: stats.occupied_rooms,
            icon: DoorClosed,
            description: 'Currently marked as occupied',
        },
        {
            label: 'Maintenance Rooms',
            value: stats.maintenance_rooms,
            icon: ShieldCheck,
            description: 'Temporarily unavailable rooms',
        },
    ];

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-xl font-semibold tracking-tight">
                            Dashboard
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isSuperadmin
                                ? 'Monitor room availability, review pending requests, and manage user roles.'
                                : isCr
                                  ? 'Track your booking activity and request available classrooms.'
                                  : 'Browse room availability and check the current classroom status.'}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href={roomsIndex.url()}
                            className={buttonVariants({ size: 'sm' })}
                        >
                            <Search className="size-3.5" />
                            Browse Rooms
                        </Link>
                        {isSuperadmin && (
                            <Link
                                href={adminRequestsIndex.url()}
                                className={buttonVariants({
                                    size: 'sm',
                                    variant: 'outline',
                                })}
                            >
                                <ClipboardCheck className="size-3.5" />
                                Review Requests
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {primaryStats.map((stat) => (
                        <Card key={stat.label} size="sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardDescription>
                                        {stat.label}
                                    </CardDescription>
                                    <stat.icon className="size-4 text-muted-foreground" />
                                </div>
                                <CardTitle className="text-2xl tabular-nums">
                                    {stat.value}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {isSuperadmin && (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {adminStats.map((stat) => (
                            <Card key={stat.label} size="sm">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardDescription>
                                            {stat.label}
                                        </CardDescription>
                                        <stat.icon className="size-4 text-muted-foreground" />
                                    </div>
                                    <CardTitle className="text-2xl tabular-nums">
                                        {stat.value}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground">
                                        {stat.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="grid gap-6 xl:grid-cols-5">
                    <Card className="xl:col-span-3">
                        <CardHeader>
                            <CardTitle>Recent Requests</CardTitle>
                            <CardDescription>
                                Your latest room request activity.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentRequests.length === 0 ? (
                                <div className="rounded-lg border border-dashed px-4 py-10 text-center">
                                    <p className="font-medium">
                                        No room requests yet
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {isCr
                                            ? 'Start from the rooms page to submit your first request.'
                                            : 'Your request history will appear here once you receive CR access.'}
                                    </p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Room</TableHead>
                                            <TableHead>Schedule</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Reviewer</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentRequests.map((request) => (
                                            <TableRow key={request.id}>
                                                <TableCell className="font-medium">
                                                    {request.room.room_number}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span>
                                                            {formatDate(
                                                                request.date,
                                                            )}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatTime(
                                                                request.start_time,
                                                            )}{' '}
                                                            -{' '}
                                                            {formatTime(
                                                                request.end_time,
                                                            )}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            statusConfig[
                                                                request.status
                                                            ].variant
                                                        }
                                                    >
                                                        {
                                                            statusConfig[
                                                                request.status
                                                            ].label
                                                        }
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {request.reviewer?.name ??
                                                        'Pending review'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="xl:col-span-2">
                        <CardHeader>
                            <CardTitle>
                                {isSuperadmin
                                    ? 'Pending Approval Queue'
                                    : 'Role Access'}
                            </CardTitle>
                            <CardDescription>
                                {isSuperadmin
                                    ? 'Latest requests that need admin action.'
                                    : 'What your current role can do in RoomBook.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {isSuperadmin ? (
                                pendingRequests.length === 0 ? (
                                    <div className="rounded-lg border border-dashed px-4 py-10 text-center">
                                        <p className="font-medium">
                                            No pending requests
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            The approval queue is clear.
                                        </p>
                                    </div>
                                ) : (
                                    pendingRequests.map((request) => (
                                        <div
                                            key={request.id}
                                            className="rounded-lg border p-3"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-medium">
                                                        Room{' '}
                                                        {
                                                            request.room
                                                                .room_number
                                                        }
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {request.user.name} •{' '}
                                                        {request.user.email}
                                                    </p>
                                                </div>
                                                <Badge variant="secondary">
                                                    Pending
                                                </Badge>
                                            </div>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {formatDate(request.date)} •{' '}
                                                {formatTime(request.start_time)}{' '}
                                                - {formatTime(request.end_time)}
                                            </p>
                                            <p className="mt-2 line-clamp-2 text-sm">
                                                {request.purpose}
                                            </p>
                                        </div>
                                    ))
                                )
                            ) : (
                                <>
                                    <div className="rounded-lg border p-3">
                                        <p className="font-medium">
                                            Authenticated
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Browse room availability and track
                                            your account notifications.
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <p className="font-medium">CR</p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Submit room booking requests and
                                            cancel your own pending requests.
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <p className="font-medium">
                                            Superadmin
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Manage users, review all requests,
                                            and oversee room availability.
                                        </p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
