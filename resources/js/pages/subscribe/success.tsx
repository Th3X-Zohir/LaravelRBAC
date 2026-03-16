import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCheck,
    CheckCircle2,
    DoorOpen,
    LayoutDashboard,
    Sparkles,
    Stars,
} from 'lucide-react';

import { index as dashboard } from '@/actions/App/Http/Controllers/DashboardController';
import { view as subscribeView } from '@/actions/App/Http/Controllers/SubscriptionController';
import { buttonVariants } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

const confettiPieces = [
    'left-[6%] top-10 h-3 w-7 rotate-12 bg-emerald-400',
    'left-[14%] top-28 h-2.5 w-5 -rotate-6 bg-sky-400',
    'left-[22%] top-16 h-3 w-3 rotate-45 rounded-sm bg-amber-300',
    'left-[31%] top-6 h-2.5 w-6 rotate-[28deg] bg-primary/80',
    'left-[42%] top-20 h-3 w-8 -rotate-[18deg] bg-emerald-300',
    'left-[55%] top-8 h-2.5 w-5 rotate-[32deg] bg-orange-300',
    'left-[66%] top-24 h-3 w-3 rotate-45 rounded-sm bg-rose-300',
    'left-[75%] top-12 h-2.5 w-7 -rotate-[24deg] bg-cyan-300',
    'left-[84%] top-30 h-3 w-6 rotate-[20deg] bg-lime-300',
    'left-[91%] top-18 h-2.5 w-5 -rotate-12 bg-yellow-300',
];

const highlights = [
    'Your payment has been confirmed and your plan can be activated immediately.',
    'You now have access to the premium subscription flow without retrying checkout.',
    'A completed transaction reference should appear in your payment provider history.',
];

const nextMoves = [
    {
        icon: <LayoutDashboard className="size-4" />,
        title: 'Open your dashboard',
        body: 'Continue into the app and start using the subscription features right away.',
    },
    {
        icon: <DoorOpen className="size-4" />,
        title: 'Start exploring',
        body: 'Browse rooms, manage requests, and move through the rest of your workflow.',
    },
    {
        icon: <Sparkles className="size-4" />,
        title: 'Keep the receipt',
        body: 'Save the payment confirmation if your team needs it for reimbursement or records.',
    },
];

export default function SubscribeSuccess() {
    return (
        <AppLayout>
            <Head title="Payment Successful" />

            <main className="relative min-h-screen overflow-hidden bg-background px-4 py-12 sm:px-6 lg:px-8">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-400/16 blur-3xl" />
                    <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-primary/14 blur-3xl" />
                    <div className="absolute top-1/3 left-0 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
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
                            <LayoutDashboard className="size-4" />
                            Dashboard
                        </Link>

                        <div className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold tracking-[0.24em] text-emerald-700 uppercase dark:text-emerald-300">
                            Payment Confirmed
                        </div>
                    </div>

                    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
                        <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/88 p-6 shadow-2xl shadow-emerald-500/10 backdrop-blur xl:p-10">
                            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-400/70 to-transparent" />

                            <div className="pointer-events-none absolute inset-x-2 top-0 h-32">
                                {confettiPieces.map((piece) => (
                                    <div
                                        key={piece}
                                        className={cn(
                                            'absolute animate-[bounce_3.2s_ease-in-out_infinite] rounded-full opacity-85 shadow-sm',
                                            piece,
                                        )}
                                    />
                                ))}
                            </div>

                            <div className="flex flex-col gap-8">
                                <div className="flex flex-wrap items-start justify-between gap-6 pt-10">
                                    <div className="max-w-2xl space-y-5">
                                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                            <CheckCheck className="size-4" />
                                            Subscription successful
                                        </div>

                                        <div className="space-y-4">
                                            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                                                Payment received. Your access is
                                                ready.
                                            </h1>
                                            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                                                Everything completed normally.
                                                You can move back into the app
                                                and continue from your
                                                dashboard.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[1.75rem] border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 shadow-lg shadow-emerald-500/10 dark:text-emerald-300">
                                        <CheckCircle2 className="size-11" />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    {highlights.map((highlight) => (
                                        <div
                                            key={highlight}
                                            className="rounded-[1.5rem] border border-border/70 bg-background/75 p-4"
                                        >
                                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                                <Stars className="size-4" />
                                            </div>
                                            <p className="text-sm leading-6 text-muted-foreground">
                                                {highlight}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href={dashboard.url()}
                                        className={cn(
                                            buttonVariants({
                                                size: 'lg',
                                            }),
                                            'h-12 rounded-full px-6 text-sm font-semibold sm:min-w-52',
                                        )}
                                    >
                                        Go to dashboard
                                        <ArrowRight className="size-4" />
                                    </Link>

                                    <Link
                                        href={subscribeView.url()}
                                        className={cn(
                                            buttonVariants({
                                                variant: 'outline',
                                                size: 'lg',
                                            }),
                                            'h-12 rounded-full px-6 text-sm font-semibold sm:min-w-52',
                                        )}
                                    >
                                        View subscription page
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <aside className="flex flex-col gap-6">
                            <div className="rounded-[2rem] border border-border/60 bg-card/88 p-6 backdrop-blur">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                                        <Sparkles className="size-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-foreground">
                                            What happens next
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            A quick orientation before you leave
                                            this page.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {nextMoves.map((item) => (
                                        <div
                                            key={item.title}
                                            className="rounded-[1.25rem] border border-border/70 bg-background/70 p-4"
                                        >
                                            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                {item.icon}
                                            </div>
                                            <h3 className="text-sm font-semibold text-foreground">
                                                {item.title}
                                            </h3>
                                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                                {item.body}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[2rem] border border-dashed border-emerald-500/30 bg-emerald-500/8 p-6">
                                <p className="text-sm font-semibold tracking-[0.2em] text-emerald-700 uppercase dark:text-emerald-300">
                                    Completed
                                </p>
                                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                    If your team needs proof of payment, keep
                                    the transaction receipt from the gateway for
                                    your records.
                                </p>
                            </div>
                        </aside>
                    </section>
                </div>
            </main>
        </AppLayout>
    );
}
