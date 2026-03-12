import { Link } from '@inertiajs/react';
import { DoorOpen } from 'lucide-react';
import { index as roomsIndex } from '@/actions/App/Http/Controllers/RoomController';
import { ThemeToggle } from '@/components/theme-toggle';
import { useI18n } from '@/lib/i18n';

export default function GuestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { t } = useI18n();

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Minimal top bar */}
            <header className="flex h-14 items-center border-b px-6">
                <Link
                    href={roomsIndex.url()}
                    className="flex items-center gap-2 text-foreground"
                >
                    <DoorOpen className="size-5" />
                    <span className="text-sm font-semibold tracking-tight">
                        {t('brand.name')}
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
                    {t('common.footer_rights', {
                        year: new Date().getFullYear(),
                        app: t('brand.name'),
                    })}
                </p>
            </footer>
        </div>
    );
}
