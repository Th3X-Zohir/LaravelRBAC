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
import { useI18n } from '@/lib/i18n';
import { formatDate, formatNumber, formatTime, localizeDigits } from '@/lib/utils';
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
    pending: { variant: 'secondary' as const, labelKey: 'status.pending' },
    approved: { variant: 'default' as const, labelKey: 'status.approved' },
    rejected: { variant: 'destructive' as const, labelKey: 'status.rejected' },
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
    const { t, locale } = useI18n();
    const roles = auth.user?.roles ?? [];
    const isSuperadmin = roles.includes('superadmin');
    const isCr = roles.includes('cr');

    const primaryStats = [
        {
            label: t('dashboard.card_available_rooms'),
            value: stats.available_rooms,
            icon: DoorOpen,
            description: t('dashboard.card_available_rooms_desc'),
        },
        {
            label: t('dashboard.card_total_rooms'),
            value: stats.total_rooms,
            icon: Search,
            description: t('dashboard.card_total_rooms_desc'),
        },
        {
            label: t('dashboard.card_my_pending_requests'),
            value: stats.my_pending_requests,
            icon: CalendarClock,
            description: t('dashboard.card_my_pending_requests_desc'),
        },
        {
            label: t('dashboard.card_my_approved_requests'),
            value: stats.my_approved_requests,
            icon: CalendarCheck,
            description: t('dashboard.card_my_approved_requests_desc'),
        },
    ];

    const adminStats = [
        {
            label: t('dashboard.card_pending_approvals'),
            value: stats.pending_approvals ?? 0,
            icon: ClipboardCheck,
            description: t('dashboard.card_pending_approvals_desc'),
        },
        {
            label: t('dashboard.card_total_users'),
            value: stats.total_users ?? 0,
            icon: Users,
            description: t('dashboard.card_total_users_desc'),
        },
        {
            label: t('dashboard.card_occupied_rooms'),
            value: stats.occupied_rooms,
            icon: DoorClosed,
            description: t('dashboard.card_occupied_rooms_desc'),
        },
        {
            label: t('dashboard.card_maintenance_rooms'),
            value: stats.maintenance_rooms,
            icon: ShieldCheck,
            description: t('dashboard.card_maintenance_rooms_desc'),
        },
    ];

    return (
        <AppLayout>
            <Head title={t('dashboard.title')} />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-xl font-semibold tracking-tight">
                            {t('dashboard.title')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isSuperadmin
                                ? t('dashboard.subtitle_superadmin')
                                : isCr
                                  ? t('dashboard.subtitle_cr')
                                  : t('dashboard.subtitle_guest')}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href={roomsIndex.url()}
                            className={buttonVariants({ size: 'sm' })}
                        >
                            <Search className="size-3.5" />
                            {t('dashboard.browse_rooms')}
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
                                {t('dashboard.review_requests')}
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
                                    {formatNumber(stat.value, locale)}
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
                            <CardTitle>{t('dashboard.recent_title')}</CardTitle>
                            <CardDescription>
                                {t('dashboard.recent_desc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentRequests.length === 0 ? (
                                <div className="rounded-lg border border-dashed px-4 py-10 text-center">
                                    <p className="font-medium">
                                        {t('dashboard.recent_empty_title')}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {isCr
                                            ? t('dashboard.empty_non_cr')
                                            : t('dashboard.empty_cr')}
                                    </p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                {t('dashboard.table_room')}
                                            </TableHead>
                                            <TableHead>
                                                {t('dashboard.table_schedule')}
                                            </TableHead>
                                            <TableHead>
                                                {t('dashboard.table_status')}
                                            </TableHead>
                                            <TableHead>
                                                {t('dashboard.table_reviewer')}
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentRequests.map((request) => (
                                            <TableRow key={request.id}>
                                                <TableCell className="font-medium">
                                                    {localizeDigits(
                                                        request.room.room_number,
                                                        locale,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span>
                                                            {formatDate(
                                                                request.date,
                                                                locale,
                                                            )}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatTime(
                                                                request.start_time,
                                                                locale,
                                                            )}{' '}
                                                            -{' '}
                                                            {formatTime(
                                                                request.end_time,
                                                                locale,
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
                                                        {t(
                                                            statusConfig[
                                                                request.status
                                                            ].labelKey,
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {request.reviewer?.name ??
                                                        t('status.pending_review')}
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
                                    ? t('dashboard.section_pending_queue_title')
                                    : t('dashboard.section_role_access_title')}
                            </CardTitle>
                            <CardDescription>
                                {isSuperadmin
                                    ? t('dashboard.section_pending_queue_desc')
                                    : t('dashboard.section_role_access_desc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {isSuperadmin ? (
                                pendingRequests.length === 0 ? (
                                    <div className="rounded-lg border border-dashed px-4 py-10 text-center">
                                        <p className="font-medium">
                                            {t('dashboard.pending_empty_title')}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {t('dashboard.pending_empty_desc')}
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
                                                        {t(
                                                            'dashboard.pending_room_label',
                                                            {
                                                                room: request
                                                                    .room
                                                                    .room_number,
                                                            },
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {request.user.name} •{' '}
                                                        {request.user.email}
                                                    </p>
                                                </div>
                                                <Badge variant="secondary">
                                                    {t('status.pending')}
                                                </Badge>
                                            </div>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {formatDate(request.date, locale)}{' '}
                                                •{' '}
                                                {formatTime(
                                                    request.start_time,
                                                    locale,
                                                )}{' '}
                                                -{' '}
                                                {formatTime(
                                                    request.end_time,
                                                    locale,
                                                )}
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
                                            {t('roles.authenticated')}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {t(
                                                'dashboard.role_access_authenticated_desc',
                                            )}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <p className="font-medium">
                                            {t('roles.cr')}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {t('dashboard.role_access_cr_desc')}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <p className="font-medium">
                                            {t('roles.superadmin')}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {t(
                                                'dashboard.role_access_superadmin_desc',
                                            )}
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
