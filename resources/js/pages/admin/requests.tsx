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
import { formatDate, formatTime } from '@/lib/utils';

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
    pending: { variant: 'secondary' as const, label: 'Pending' },
    approved: { variant: 'default' as const, label: 'Approved' },
    rejected: { variant: 'destructive' as const, label: 'Rejected' },
};

function getReviewerLabel(request: AdminRoomRequest): string {
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
                return 'Rejected (system)';
            }
        }

        return 'Rejected';
    }

    return 'Awaiting review';
}

export default function AdminRequests({
    roomRequests,
}: {
    roomRequests: AdminRoomRequest[];
}) {
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
            <Head title="Manage Requests" />

            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">
                        Manage Requests
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Review all room booking requests and notify requesters
                        through the queued notification system.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Approval Queue</CardTitle>
                        <CardDescription>
                            Pending requests require approve or reject actions
                            from a superadmin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Requester</TableHead>
                                    <TableHead>Room</TableHead>
                                    <TableHead>Schedule</TableHead>
                                    <TableHead>Purpose</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Reviewer</TableHead>
                                    <TableHead className="text-right">
                                        Actions
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
                                                    {request.room.room_number}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>
                                                    {formatDate(request.date)}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="size-3" />
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
                                                {
                                                    statusConfig[request.status]
                                                        .label
                                                }
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {getReviewerLabel(request)}
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
                                                        View
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
                                                        Approve
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
                                                        Reject
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
                                                    View
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
