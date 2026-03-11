import type { Auth } from '@/types/auth';
import type { Notifications } from '@/types/notification';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            notifications: Notifications;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
