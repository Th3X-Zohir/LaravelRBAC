import { Link, router, usePage, usePoll } from '@inertiajs/react';
import {
    Bell,
    BellOff,
    CalendarCheck,
    CheckCheck,
    Info,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

import {
    markAllAsRead as markAllNotificationsAsRead,
    visit,
} from '@/actions/App/Http/Controllers/NotificationController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { NotificationItem, Notifications } from '@/types';

const typeConfig = {
    approved: {
        icon: CalendarCheck,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    },
    rejected: {
        icon: XCircle,
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-950/50',
    },
    info: {
        icon: Info,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-950/50',
    },
    reminder: {
        icon: Bell,
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/50',
    },
} as const;

function NotificationRow({
    notification,
    onVisit,
}: {
    notification: NotificationItem;
    onVisit: () => void;
}) {
    const config = typeConfig[notification.type] ?? typeConfig.info;
    const Icon = config.icon;

    return (
        <Link
            href={visit.url(notification.id)}
            className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                !notification.read ? 'bg-muted/30' : ''
            }`}
            onClick={onVisit}
        >
            <div
                className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${config.bg}`}
            >
                <Icon className={`size-3.5 ${config.color}`} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p
                        className={`truncate text-sm ${!notification.read ? 'font-semibold' : 'font-medium'}`}
                    >
                        {notification.title}
                    </p>
                    {!notification.read && (
                        <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                </div>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                    {notification.message}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                    {notification.time}
                </p>
            </div>
        </Link>
    );
}

export default function NotificationModal() {
    const { notifications } = usePage<{ notifications: Notifications }>().props;
    const [open, setOpen] = useState(false);

    // Poll every 5 seconds to refresh shared props (including notifications)
    usePoll(5000, {
        only: ['notifications'],
    });

    const { unreadCount = 0, items = [] } = notifications ?? {};

    function handleMarkAllAsRead() {
        router.post(
            markAllNotificationsAsRead.url(),
            {},
            { only: ['notifications'] },
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="relative flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                <Bell className="size-4" />
                <span className="hidden sm:inline">Notifications</span>
                {unreadCount > 0 && (
                    <Badge
                        variant="destructive"
                        className="ml-0.5 h-4 min-w-4 px-1 text-[10px]"
                    >
                        {unreadCount}
                    </Badge>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center justify-between pr-6">
                        <DialogTitle>Notifications</DialogTitle>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="xs"
                                onClick={handleMarkAllAsRead}
                            >
                                <CheckCheck className="mr-1 size-3.5" />
                                Mark all read
                            </Button>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <p className="text-sm text-muted-foreground">
                            {unreadCount} unread notification
                            {unreadCount > 1 ? 's' : ''}
                        </p>
                    )}
                </DialogHeader>

                <div className="-mx-4 max-h-80 overflow-y-auto">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-center">
                            <BellOff className="size-8 text-muted-foreground" />
                            <p className="text-sm font-medium">
                                No notifications
                            </p>
                            <p className="text-xs text-muted-foreground">
                                We'll notify you when something happens.
                            </p>
                        </div>
                    ) : (
                        items.map((notification, idx) => (
                            <div key={notification.id}>
                                <NotificationRow
                                    notification={notification}
                                    onVisit={() => setOpen(false)}
                                />
                                {idx < items.length - 1 && <Separator />}
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
