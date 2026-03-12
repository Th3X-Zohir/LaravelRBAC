import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarCheck,
    Clock,
    DoorOpen,
    ExternalLink,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

import {
    cancel,
    show,
} from '@/actions/App/Http/Controllers/RoomRequestController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { useI18n } from '@/lib/i18n';
import { formatDate, formatDateTime, formatTime } from '@/lib/utils';

type RoomRequest = {
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

const statusConfig = {
    pending: { variant: 'secondary' as const, labelKey: 'status.pending' },
    approved: { variant: 'default' as const, labelKey: 'status.approved' },
    rejected: { variant: 'destructive' as const, labelKey: 'status.rejected' },
};

function getReviewerLabel(
    request: RoomRequest,
    t: (key: string) => string,
): string {
    if (request.reviewer !== null) {
        return request.reviewer.name;
    }

    if (request.status === 'rejected') {
        const requestDate = new Date(request.date);
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        if (!Number.isNaN(requestDate.getTime())) {
            const requestDay = new Date(
                requestDate.getFullYear(),
                requestDate.getMonth(),
                requestDate.getDate(),
            );

            if (requestDay < today) {
                return t('status.rejected_system');
            }
        }

        return t('status.rejected');
    }

    return t('status.awaiting_review');
}

export default function Requests({
    roomRequests,
}: {
    roomRequests: RoomRequest[];
}) {
    const { t, locale } = useI18n();
    const [activeTab, setActiveTab] = useState('all');
    const tabLabel =
        activeTab === 'pending'
            ? t('requests.tab_pending')
            : activeTab === 'approved'
              ? t('requests.tab_approved')
              : activeTab === 'rejected'
                ? t('requests.tab_rejected')
                : t('requests.tab_all');

    const filteredRequests =
        activeTab === 'all'
            ? roomRequests
            : roomRequests.filter((request) => request.status === activeTab);

    const pendingCount = roomRequests.filter(
        (request) => request.status === 'pending',
    ).length;
    const approvedCount = roomRequests.filter(
        (request) => request.status === 'approved',
    ).length;

    function cancelRequest(requestId: number): void {
        router.delete(cancel.url(requestId), {
            preserveScroll: true,
        });
    }

    return (
        <AppLayout>
            <Head title={t('requests.title')} />

            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">
                        {t('requests.title')}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t('requests.subtitle')}
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card size="sm">
                        <CardHeader>
                            <CardDescription>
                                {t('requests.tab_pending')}
                            </CardDescription>
                            <CardTitle className="text-2xl tabular-nums">
                                {pendingCount}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card size="sm">
                        <CardHeader>
                            <CardDescription>
                                {t('requests.tab_approved')}
                            </CardDescription>
                            <CardTitle className="text-2xl tabular-nums">
                                {approvedCount}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card size="sm">
                        <CardHeader>
                            <CardDescription>
                                {t('requests.total_requests')}
                            </CardDescription>
                            <CardTitle className="text-2xl tabular-nums">
                                {roomRequests.length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList variant="line">
                        <TabsTrigger value="all">
                            {t('requests.tab_all')}
                        </TabsTrigger>
                        <TabsTrigger value="pending">
                            {t('requests.tab_pending')}
                        </TabsTrigger>
                        <TabsTrigger value="approved">
                            {t('requests.tab_approved')}
                        </TabsTrigger>
                        <TabsTrigger value="rejected">
                            {t('requests.tab_rejected')}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value={activeTab}>
                        {filteredRequests.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-14 text-center">
                                <CalendarCheck className="size-10 text-muted-foreground" />
                                <p className="font-medium">
                                    {t('requests.empty_title')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {t('requests.empty_desc', {
                                        tab: tabLabel,
                                    })}
                                </p>
                            </div>
                        ) : (
                            <Card>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                {t('requests.table_room')}
                                            </TableHead>
                                            <TableHead>
                                                {t('requests.table_schedule')}
                                            </TableHead>
                                            <TableHead>
                                                {t('requests.table_purpose')}
                                            </TableHead>
                                            <TableHead>
                                                {t('requests.table_status')}
                                            </TableHead>
                                            <TableHead>
                                                {t('requests.table_reviewer')}
                                            </TableHead>
                                            <TableHead>
                                                {t('requests.table_submitted')}
                                            </TableHead>
                                            <TableHead className="text-right">
                                                {t('common.action')}
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRequests.map((request) => (
                                            <TableRow key={request.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <DoorOpen className="size-4 text-muted-foreground" />
                                                        <span className="font-medium">
                                                            {
                                                                request.room
                                                                    .room_number
                                                            }
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm">
                                                            {formatDate(
                                                                request.date,
                                                                locale,
                                                            )}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Clock className="size-3" />
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
                                                <TableCell className="max-w-xs whitespace-normal text-muted-foreground">
                                                    {request.purpose}
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
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {getReviewerLabel(
                                                        request,
                                                        t,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {formatDateTime(
                                                        request.created_at,
                                                        locale,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {request.status ===
                                                    'pending' ? (
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                nativeButton={
                                                                    false
                                                                }
                                                                render={
                                                                    <Link
                                                                        href={show.url(
                                                                            request.id,
                                                                        )}
                                                                    />
                                                                }
                                                            >
                                                                <ExternalLink className="size-3.5" />
                                                                {t(
                                                                    'common.view',
                                                                )}
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() =>
                                                                    cancelRequest(
                                                                        request.id,
                                                                    )
                                                                }
                                                            >
                                                                <XCircle className="size-3.5" />
                                                                {t(
                                                                    'common.cancel',
                                                                )}
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            nativeButton={false}
                                                            render={
                                                                <Link
                                                                    href={show.url(
                                                                        request.id,
                                                                    )}
                                                                />
                                                            }
                                                        >
                                                            <ExternalLink className="size-3.5" />
                                                            {t('common.view')}
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
