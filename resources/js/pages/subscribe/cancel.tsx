import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CircleSlash2,
    Clock3,
    CreditCard,
    LayoutDashboard,
    RefreshCcw,
    ShieldQuestion,
} from 'lucide-react';

import { index as dashboard } from '@/actions/App/Http/Controllers/DashboardController';
import { view as subscribeView } from '@/actions/App/Http/Controllers/SubscriptionController';
import { buttonVariants } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

const reasons = [
    'You closed the payment gateway before the final confirmation step.',
    'You chose to stop the payment instead of submitting it for approval.',
    'Your payment session ended before you completed the gateway flow.',
];

const reminders = [
    'No subscription was activated from this canceled payment attempt.',
    'You can safely return and start a fresh payment session any time.',
    'If a charge still appears, verify the final status with your provider.',
];

export default function SubscribeCancel() {
    return (
        <AppLayout>
            <Head title="Payment Canceled" />

            <main className="relative min-h-screen overflow-hidden bg-background px-4 py-12 sm:px-6 lg:px-8">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-12 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-400/16 blur-3xl" />
                    <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-primary/12 blur-3xl" />
                    <div className="absolute top-1/3 left-0 h-64 w-64 rounded-full bg-sky-400/8 blur-3xl" />
                </div>

                <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
                    <div className="flex items-center justify-between gap-4">
                        <Link
                            href={dashboard.url()}
                            className={cn(
                                buttonVariants({
                                    variant: 'ghost',
                                    size: 'sm',
                                }),
                                'rounded-full px-3',
                            )}
                        >
                            <ArrowLeft className="size-4" />
                            Back to dashboard
                        </Link>

                        <div className="rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold tracking-[0.24em] text-amber-700 uppercase dark:text-amber-300">
                            Payment Canceled
                        </div>
                    </div>

                    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
                        <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/88 p-6 shadow-2xl shadow-amber-500/10 backdrop-blur xl:p-10">
                            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-400/70 to-transparent" />

                            <div className="flex flex-col gap-8">
                                <div className="flex flex-wrap items-start justify-between gap-6">
                                    <div className="max-w-2xl space-y-5">
                                        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-700 dark:text-amber-300">
                                            <CircleSlash2 className="size-4" />
                                            Checkout canceled
                                        </div>

                                        <div className="space-y-4">
                                            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                                                The payment was canceled before
                                                completion.
                                            </h1>
                                            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                                                Nothing was activated from this
                                                attempt. You can restart the
                                                checkout whenever you are ready.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[1.75rem] border border-amber-500/25 bg-amber-500/10 text-amber-700 shadow-lg shadow-amber-500/10 dark:text-amber-300">
                                        <ShieldQuestion className="size-11" />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    {reasons.map((reason) => (
                                        <div
                                            key={reason}
                                            className="rounded-[1.5rem] border border-border/70 bg-background/75 p-4"
                                        >
                                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-300">
                                                <Clock3 className="size-4" />
                                            </div>
                                            <p className="text-sm leading-6 text-muted-foreground">
                                                {reason}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href={subscribeView.url()}
                                        className={cn(
                                            buttonVariants({
                                                size: 'lg',
                                            }),
                                            'h-12 rounded-full px-6 text-sm font-semibold sm:min-w-52',
                                        )}
                                    >
                                        <RefreshCcw className="size-4" />
                                        Start checkout again
                                    </Link>

                                    <Link
                                        href={dashboard.url()}
                                        className={cn(
                                            buttonVariants({
                                                variant: 'outline',
                                                size: 'lg',
                                            }),
                                            'h-12 rounded-full px-6 text-sm font-semibold sm:min-w-52',
                                        )}
                                    >
                                        <LayoutDashboard className="size-4" />
                                        Return to dashboard
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <aside className="flex flex-col gap-6">
                            <div className="rounded-[2rem] border border-border/60 bg-card/88 p-6 backdrop-blur">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                                        <CreditCard className="size-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-foreground">
                                            Before retrying
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            A few practical notes for the next
                                            attempt.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {reminders.map((reminder, index) => (
                                        <div
                                            key={reminder}
                                            className="flex gap-3 rounded-[1.25rem] border border-border/70 bg-background/70 p-4"
                                        >
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
                                                {index + 1}
                                            </div>
                                            <p className="text-sm leading-6 text-muted-foreground">
                                                {reminder}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[2rem] border border-dashed border-amber-500/30 bg-amber-500/8 p-6">
                                <p className="text-sm font-semibold tracking-[0.2em] text-amber-700 uppercase dark:text-amber-300">
                                    Safe to retry
                                </p>
                                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                    Use the retry action when you are ready to
                                    open a fresh payment session.
                                </p>
                            </div>
                        </aside>
                    </section>
                </div>
            </main>
        </AppLayout>
    );
}
