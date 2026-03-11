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
    pending: { variant: 'secondary' as const, label: 'Pending' },
    approved: { variant: 'default' as const, label: 'Approved' },
    rejected: { variant: 'destructive' as const, label: 'Rejected' },
};

export default function Requests({
    roomRequests,
}: {
    roomRequests: RoomRequest[];
}) {
    const [activeTab, setActiveTab] = useState('all');

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
            <Head title="My Requests" />

            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">
                        My Requests
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Track your classroom booking submissions and review
                        outcomes.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card size="sm">
                        <CardHeader>
                            <CardDescription>Pending</CardDescription>
                            <CardTitle className="text-2xl tabular-nums">
                                {pendingCount}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card size="sm">
                        <CardHeader>
                            <CardDescription>Approved</CardDescription>
                            <CardTitle className="text-2xl tabular-nums">
                                {approvedCount}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card size="sm">
                        <CardHeader>
                            <CardDescription>Total Requests</CardDescription>
                            <CardTitle className="text-2xl tabular-nums">
                                {roomRequests.length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList variant="line">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="approved">Approved</TabsTrigger>
                        <TabsTrigger value="rejected">Rejected</TabsTrigger>
                    </TabsList>
                    <TabsContent value={activeTab}>
                        {filteredRequests.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-14 text-center">
                                <CalendarCheck className="size-10 text-muted-foreground" />
                                <p className="font-medium">No requests found</p>
                                <p className="text-sm text-muted-foreground">
                                    There are no {activeTab} requests to show.
                                </p>
                            </div>
                        ) : (
                            <Card>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Room</TableHead>
                                            <TableHead>Date & Time</TableHead>
                                            <TableHead>Purpose</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Reviewer</TableHead>
                                            <TableHead>Submitted</TableHead>
                                            <TableHead className="text-right">
                                                Action
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
                                                            )}
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
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {request.reviewer?.name ??
                                                        (request.status ===
                                                        'rejected'
                                                            ? 'Automatically expired'
                                                            : 'Awaiting review')}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {formatDateTime(
                                                        request.created_at,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {request.status ===
                                                    'pending' ? (
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                render={
                                                                    <Link
                                                                        href={show.url(
                                                                            request.id,
                                                                        )}
                                                                    />
                                                                }
                                                            >
                                                                <ExternalLink className="size-3.5" />
                                                                View
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
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            render={
                                                                <Link
                                                                    href={show.url(
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
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
