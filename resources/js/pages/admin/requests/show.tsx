import { Head } from '@inertiajs/react';
import type { RequestDetailsProps } from '@/components/request-details';

import RequestDetails from '@/components/request-details';
import AppLayout from '@/layouts/app-layout';

export default function AdminRequestShow({
    roomRequest,
}: {
    roomRequest: RequestDetailsProps['roomRequest'];
}) {
    return (
        <AppLayout>
            <Head title={`Manage Request #${roomRequest.id}`} />

            <RequestDetails roomRequest={roomRequest} viewer="admin" />
        </AppLayout>
    );
}
