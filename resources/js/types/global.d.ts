import type { Auth } from '@/types/auth';
import type { Notifications } from '@/types/notification';

export type AvailableLocale = {
    code: string;
    name: string;
};

export type Translations = Record<string, unknown>;

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            notifications: Notifications;
            locale: string;
            availableLocales: AvailableLocale[];
            translations: Translations;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
