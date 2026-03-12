import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    DoorOpen,
    ExternalLink,
    XCircle,
} from 'lucide-react';

import {
    adminShow,
    approve,
    reject,
} from '@/actions/App/Http/Controllers/RoomRequestController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { formatDate, formatTime, localizeDigits } from '@/lib/utils';

type AdminRoomRequest = {
    id: number;
    date: string;
    start_time: string;
    end_time: string;
    purpose: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    reviewed_at: string | null;
    room: {
        id: number;
        room_number: string;
        status: 'available' | 'occupied' | 'maintenance';
    };
    user: {
        id: number;
        name: string;
        email: string;
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
    request: AdminRoomRequest,
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

export default function AdminRequests({
    roomRequests,
}: {
    roomRequests: AdminRoomRequest[];
}) {
    const { t, locale } = useI18n();
    function approveRequest(requestId: number): void {
        router.patch(approve.url(requestId), undefined, {
            preserveScroll: true,
        });
    }

    function rejectRequest(requestId: number): void {
        router.patch(reject.url(requestId), undefined, {
            preserveScroll: true,
        });
    }

    return (
        <AppLayout>
            <Head title={t('admin_requests.title')} />

            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">
                        {t('admin_requests.title')}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t('admin_requests.subtitle')}
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('admin_requests.queue_title')}</CardTitle>
                        <CardDescription>
                            {t('admin_requests.queue_desc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        {t('admin_requests.table_requester')}
                                    </TableHead>
                                    <TableHead>
                                        {t('admin_requests.table_room')}
                                    </TableHead>
                                    <TableHead>
                                        {t('admin_requests.table_schedule')}
                                    </TableHead>
                                    <TableHead>
                                        {t('admin_requests.table_purpose')}
                                    </TableHead>
                                    <TableHead>
                                        {t('admin_requests.table_status')}
                                    </TableHead>
                                    <TableHead>
                                        {t('admin_requests.table_reviewer')}
                                    </TableHead>
                                    <TableHead className="text-right">
                                        {t('common.action')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roomRequests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {request.user.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {request.user.email}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <DoorOpen className="size-4 text-muted-foreground" />
                                                <span className="font-medium">
                                                    {localizeDigits(
                                                        request.room
                                                            .room_number,
                                                        locale,
                                                    )}
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
                                                    statusConfig[request.status]
                                                        .variant
                                                }
                                            >
                                                {t(
                                                    statusConfig[request.status]
                                                        .labelKey,
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {getReviewerLabel(request, t)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {request.status === 'pending' ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        nativeButton={false}
                                                        render={
                                                            <Link
                                                                href={adminShow.url(
                                                                    request.id,
                                                                )}
                                                            />
                                                        }
                                                    >
                                                        <ExternalLink className="size-3.5" />
                                                        {t('common.view')}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            approveRequest(
                                                                request.id,
                                                            )
                                                        }
                                                    >
                                                        <CheckCircle2 className="size-3.5" />
                                                        {t(
                                                            'request_details.approve',
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() =>
                                                            rejectRequest(
                                                                request.id,
                                                            )
                                                        }
                                                    >
                                                        <XCircle className="size-3.5" />
                                                        {t(
                                                            'request_details.reject',
                                                        )}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    nativeButton={false}
                                                    render={
                                                        <Link
                                                            href={adminShow.url(
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
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
