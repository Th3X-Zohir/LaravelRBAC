import { Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    DoorOpen,
    User2,
    XCircle,
} from 'lucide-react';

import {
    adminIndex,
    adminShow,
    approve,
    cancel,
    index,
    show,
    reject,
} from '@/actions/App/Http/Controllers/RoomRequestController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatDate, formatDateTime, formatTime } from '@/lib/utils';

type RequestDetails = {
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

export type RequestDetailsProps = {
    roomRequest: RequestDetails;
    viewer: 'admin' | 'user';
};

const statusConfig = {
    pending: { variant: 'secondary' as const, label: 'Pending' },
    approved: { variant: 'default' as const, label: 'Approved' },
    rejected: { variant: 'destructive' as const, label: 'Rejected' },
};

export default function RequestDetails({
    roomRequest,
    viewer,
}: RequestDetailsProps) {
    const reviewSummary =
        roomRequest.reviewer !== null
            ? `Reviewed by ${roomRequest.reviewer.name}`
            : roomRequest.status === 'rejected'
              ? 'Automatically expired after the requested date passed.'
              : 'Awaiting review from a superadmin.';

    function approveRequest(): void {
        router.patch(approve.url(roomRequest.id), undefined, {
            preserveScroll: true,
        });
    }

    function rejectRequest(): void {
        router.patch(reject.url(roomRequest.id), undefined, {
            preserveScroll: true,
        });
    }

    function cancelRequest(): void {
        router.delete(cancel.url(roomRequest.id), {
            preserveScroll: true,
        });
    }

    const backHref = viewer === 'admin' ? adminIndex.url() : index.url();
    const detailsHref =
        viewer === 'admin'
            ? adminShow.url(roomRequest.id)
            : show.url(roomRequest.id);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <Link
                        href={backHref}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Back to{' '}
                        {viewer === 'admin' ? 'manage requests' : 'my requests'}
                    </Link>
                    <h1 className="text-xl font-semibold tracking-tight">
                        Request #{roomRequest.id}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Review the request timeline, room details, and current
                        approval state.
                    </p>
                </div>
                <Badge variant={statusConfig[roomRequest.status].variant}>
                    {statusConfig[roomRequest.status].label}
                </Badge>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
                <Card>
                    <CardHeader>
                        <CardTitle>Request Details</CardTitle>
                        <CardDescription>
                            Complete booking context for room{' '}
                            {roomRequest.room.room_number}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border bg-muted/30 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <DoorOpen className="size-4 text-muted-foreground" />
                                Room
                            </div>
                            <p className="mt-3 text-lg font-semibold">
                                {roomRequest.room.room_number}
                            </p>
                            <p className="text-sm text-muted-foreground capitalize">
                                {roomRequest.room.status}
                            </p>
                        </div>

                        <div className="rounded-xl border bg-muted/30 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <CalendarDays className="size-4 text-muted-foreground" />
                                Schedule
                            </div>
                            <p className="mt-3 text-lg font-semibold">
                                {formatDate(roomRequest.date)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {formatTime(roomRequest.start_time)} -{' '}
                                {formatTime(roomRequest.end_time)}
                            </p>
                        </div>

                        <div className="rounded-xl border bg-muted/30 p-4 sm:col-span-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Clock3 className="size-4 text-muted-foreground" />
                                Purpose
                            </div>
                            <p className="mt-3 text-sm leading-6 text-foreground/90">
                                {roomRequest.purpose}
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-wrap justify-between gap-3">
                        <div className="text-xs text-muted-foreground">
                            Submitted on {formatDateTime(roomRequest.created_at)}
                        </div>
                        <Link
                            href={detailsHref}
                            className="text-xs text-muted-foreground hover:text-foreground"
                        >
                            Refresh details
                        </Link>
                    </CardFooter>
                </Card>

                <div className="grid gap-4">
                    <Card size="sm">
                        <CardHeader>
                            <CardTitle>Requester</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <User2 className="size-4 text-muted-foreground" />
                                {roomRequest.user.name}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {roomRequest.user.email}
                            </p>
                        </CardContent>
                    </Card>

                    <Card size="sm">
                        <CardHeader>
                            <CardTitle>Review Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p className="text-muted-foreground">{reviewSummary}</p>
                            {roomRequest.reviewed_at ? (
                                <p className="text-muted-foreground">
                                    {formatDateTime(roomRequest.reviewed_at)}
                                </p>
                            ) : null}
                        </CardContent>
                    </Card>

                    <Card size="sm">
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            {viewer === 'admin' &&
                            roomRequest.status === 'pending' ? (
                                <>
                                    <Button onClick={approveRequest}>
                                        <CheckCircle2 className="size-3.5" />
                                        Approve request
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={rejectRequest}
                                    >
                                        <XCircle className="size-3.5" />
                                        Reject request
                                    </Button>
                                </>
                            ) : null}

                            {viewer === 'user' &&
                            roomRequest.status === 'pending' ? (
                                <Button
                                    variant="destructive"
                                    onClick={cancelRequest}
                                >
                                    <XCircle className="size-3.5" />
                                    Cancel request
                                </Button>
                            ) : null}

                            {roomRequest.status !== 'pending' ? (
                                <p className="text-sm text-muted-foreground">
                                    This request has already been reviewed.
                                </p>
                            ) : null}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
