import { Link } from '@inertiajs/react';
import { DoorOpen } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function GuestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Minimal top bar */}
            <header className="flex h-14 items-center border-b px-6">
                <Link
                    href="/rooms"
                    className="flex items-center gap-2 text-foreground"
                >
                    <DoorOpen className="size-5" />
                    <span className="text-sm font-semibold tracking-tight">
                        RoomBook
                    </span>
                </Link>

                <div className="ml-auto flex items-center">
                    <ThemeToggle />
                </div>
            </header>

            {/* Centered content area */}
            <main className="flex flex-1 items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">{children}</div>
            </main>

            {/* Minimal footer */}
            <footer className="flex h-12 items-center justify-center border-t px-6">
                <p className="text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} RoomBook. All rights
                    reserved.
                </p>
            </footer>
        </div>
    );
}
