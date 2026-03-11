import { Link, router, usePage } from '@inertiajs/react';
import {
    CalendarCheck,
    ClipboardCheck,
    DoorOpen,
    LayoutDashboard,
    LogOut,
    Menu,
    Search,
    ShieldCheck,
    Users,
} from 'lucide-react';
import { useState } from 'react';

import { index as adminUsersIndex } from '@/actions/App/Http/Controllers/Admin/UserController';
import Logout from '@/actions/App/Http/Controllers/Auth/LogoutController';
import { index as dashboard } from '@/actions/App/Http/Controllers/DashboardController';
import { index as roomsIndex } from '@/actions/App/Http/Controllers/RoomController';
import {
    adminIndex as adminRequestsIndex,
    index as requestsIndex,
} from '@/actions/App/Http/Controllers/RoomRequestController';
import NotificationModal from '@/components/notification-modal';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Auth } from '@/types';

type NavItem = {
    label: string;
    href: string;
    icon: React.ReactNode;
    match: string;
};

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function getRoleLabel(roles: string[]): string {
    if (roles.includes('superadmin')) {
        return 'Superadmin';
    }

    if (roles.includes('cr')) {
        return 'CR';
    }

    return 'Authenticated';
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { auth, url } = usePage<{ auth: Auth; url: string }>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const user = auth.user;

    if (user === null) {
        return <>{children}</>;
    }

    const roles = user.roles ?? [];
    const isSuperadmin = roles.includes('superadmin');
    const currentPath =
        typeof url === 'string' ? url : window.location.pathname;

    const navItems: NavItem[] = [
        {
            label: 'Dashboard',
            href: dashboard.url(),
            icon: <LayoutDashboard className="size-4" />,
            match: '/dashboard',
        },
        {
            label: 'Rooms',
            href: roomsIndex.url(),
            icon: <Search className="size-4" />,
            match: '/rooms',
        },
        {
            label: 'My Requests',
            href: requestsIndex.url(),
            icon: <CalendarCheck className="size-4" />,
            match: '/requests',
        },
        ...(isSuperadmin
            ? [
                  {
                      label: 'Manage Users',
                      href: adminUsersIndex.url(),
                      icon: <Users className="size-4" />,
                      match: '/admin/users',
                  },
                  {
                      label: 'Manage Requests',
                      href: adminRequestsIndex.url(),
                      icon: <ClipboardCheck className="size-4" />,
                      match: '/admin/requests',
                  },
              ]
            : []),
    ];

    function logout(): void {
        router.post(Logout.url());
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
                <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
                    <Link
                        href={dashboard.url()}
                        className="flex shrink-0 items-center gap-2 text-foreground"
                    >
                        <DoorOpen className="size-5" />
                        <span className="text-sm font-semibold tracking-tight">
                            RoomBook
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-1 md:flex">
                        {navItems.map((item) => {
                            const isActive = currentPath.startsWith(item.match);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    prefetch={true}
                                    className={`relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                                        isActive
                                            ? 'font-medium text-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {item.icon}
                                    <span className="hidden sm:inline">
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="ml-auto flex items-center gap-1 sm:gap-2">
                        <NotificationModal />
                        <ThemeToggle />
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-full ring-ring/50 outline-none focus-visible:ring-2">
                                <Avatar className="size-7">
                                    <AvatarFallback className="bg-muted text-xs font-medium">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                sideOffset={8}
                                className="w-60"
                            >
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-sm font-medium">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <Badge
                                                variant={
                                                    isSuperadmin
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                                className="w-fit"
                                            >
                                                <ShieldCheck className="size-3" />
                                                {getRoleLabel(roles)}
                                            </Badge>
                                        </div>
                                    </DropdownMenuLabel>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onClick={logout}
                                    >
                                        <LogOut className="mr-1.5" />
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Dialog
                            open={mobileMenuOpen}
                            onOpenChange={setMobileMenuOpen}
                        >
                            <DialogTrigger
                                render={
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        className="md:hidden"
                                    />
                                }
                            >
                                <Menu className="size-4" />
                                <span className="sr-only">Open navigation</span>
                            </DialogTrigger>
                            <DialogContent
                                className="max-w-sm p-0"
                                showCloseButton={false}
                            >
                                <DialogHeader className="border-b px-4 py-4">
                                    <DialogTitle>Navigate</DialogTitle>
                                    <DialogDescription>
                                        Quick access to the main sections of
                                        RoomBook.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-1 p-3">
                                    {navItems.map((item) => {
                                        const isActive = currentPath.startsWith(
                                            item.match,
                                        );

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                prefetch={true}
                                                onClick={() =>
                                                    setMobileMenuOpen(false)
                                                }
                                                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                                                    isActive
                                                        ? 'bg-muted font-medium text-foreground'
                                                        : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                                                }`}
                                            >
                                                {item.icon}
                                                <span>{item.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
                {children}
            </main>
        </div>
    );
}
