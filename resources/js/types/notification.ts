export type NotificationItem = {
    id: string;
    title: string;
    message: string;
    type: 'approved' | 'rejected' | 'info' | 'reminder';
    read: boolean;
    time: string;
    created_at: string;
    visit_url: string;
};

export type Notifications = {
    unreadCount: number;
    items: NotificationItem[];
};
