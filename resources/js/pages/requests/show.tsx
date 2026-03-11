import { Head } from '@inertiajs/react';
import type { RequestDetailsProps } from '@/components/request-details';

import RequestDetails from '@/components/request-details';
import AppLayout from '@/layouts/app-layout';

export default function RequestShow({
    roomRequest,
}: {
    roomRequest: RequestDetailsProps['roomRequest'];
}) {
    return (
        <AppLayout>
            <Head title={`Request #${roomRequest.id}`} />

            <RequestDetails roomRequest={roomRequest} viewer="user" />
        </AppLayout>
    );
}
