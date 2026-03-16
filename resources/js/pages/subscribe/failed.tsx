import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    CreditCard,
    LifeBuoy,
    RefreshCcw,
    ShieldAlert,
} from 'lucide-react';

import { index as dashboard } from '@/actions/App/Http/Controllers/DashboardController';
import { view as subscribeView } from '@/actions/App/Http/Controllers/SubscriptionController';
import { buttonVariants } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

const checkpoints = [
    'Your mobile banking or card session may have expired before confirmation.',
    'The provider may have declined the payment for security or limit reasons.',
    'A network interruption may have interrupted the final gateway callback.',
];

const nextSteps = [
    'Retry the payment and complete the checkout flow in one session.',
    'Verify your balance, card status, or gateway approval limit.',
    'Contact support if the amount was deducted but the subscription did not activate.',
];

export default function SubscribeFailed() {
    return (
        <AppLayout>
            <Head title="Payment Failed" />

            <main className="relative min-h-screen overflow-hidden bg-background px-4 py-12 sm:px-6 lg:px-8">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-destructive/18 blur-3xl" />
                    <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-primary/14 blur-3xl" />
                    <div className="absolute top-1/3 left-0 h-64 w-64 rounded-full bg-orange-500/12 blur-3xl dark:bg-orange-400/10" />
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

                        <div className="rounded-full border border-destructive/25 bg-destructive/10 px-4 py-1.5 text-xs font-semibold tracking-[0.24em] text-destructive uppercase">
                            Transaction Interrupted
                        </div>
                    </div>

                    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
                        <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/85 p-6 shadow-2xl shadow-destructive/10 backdrop-blur xl:p-10">
                            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-destructive/60 to-transparent" />

                            <div className="flex flex-col gap-8">
                                <div className="flex flex-wrap items-start justify-between gap-6">
                                    <div className="max-w-2xl space-y-5">
                                        <div className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/8 px-3 py-1 text-sm font-medium text-destructive">
                                            <AlertTriangle className="size-4" />
                                            Payment failed
                                        </div>

                                        <div className="space-y-4">
                                            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                                                Your subscription payment did
                                                not go through.
                                            </h1>
                                            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                                                No subscription was activated.
                                                You can safely retry the payment
                                                after reviewing the checks
                                                below.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[1.75rem] border border-destructive/25 bg-destructive/10 text-destructive shadow-lg shadow-destructive/10">
                                        <ShieldAlert className="size-11" />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    {checkpoints.map((checkpoint) => (
                                        <div
                                            key={checkpoint}
                                            className="rounded-[1.5rem] border border-border/70 bg-background/75 p-4"
                                        >
                                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-foreground">
                                                <CreditCard className="size-4" />
                                            </div>
                                            <p className="text-sm leading-6 text-muted-foreground">
                                                {checkpoint}
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
                                        Try payment again
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <aside className="flex flex-col gap-6">
                            <div className="rounded-[2rem] border border-border/60 bg-card/85 p-6 backdrop-blur">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                                        <LifeBuoy className="size-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-foreground">
                                            Before you retry
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Quick checks that usually resolve
                                            payment failures.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {nextSteps.map((step, index) => (
                                        <div
                                            key={step}
                                            className="flex gap-3 rounded-[1.25rem] border border-border/70 bg-background/70 p-4"
                                        >
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
                                                {index + 1}
                                            </div>
                                            <p className="text-sm leading-6 text-muted-foreground">
                                                {step}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[2rem] border border-dashed border-destructive/30 bg-destructive/7 p-6">
                                <p className="text-sm font-semibold tracking-[0.2em] text-destructive uppercase">
                                    Need support?
                                </p>
                                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                    If you were charged but still landed on this
                                    page, keep the transaction reference from
                                    your payment provider and contact support.
                                </p>
                            </div>
                        </aside>
                    </section>
                </div>
            </main>
        </AppLayout>
    );
}
