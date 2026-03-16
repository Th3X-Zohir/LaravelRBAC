import { Head, usePage } from '@inertiajs/react';
import { form } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { subscribe } from "@/actions/App/Http/Controllers/SubscriptionController"
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

const features = [
    'Unlimited access to all features',
    'Priority customer support',
    'Advanced analytics dashboard',
    'Custom integrations',
    '99.9% uptime guarantee',
    'API access included',
];

export default function Subscribe() {
    const {
        props
    } = usePage();

    const {plan} = props;

    return (
        <AppLayout>
            <Head title="Subscribe" />

            <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
                <div className="w-full max-w-lg">
                    {/* Header */}
                    <div className="mb-10 text-center">
                        <p className="mb-3 text-sm font-medium tracking-wide text-primary uppercase">
                            Simple Pricing
                        </p>
                        <h1 className="text-4xl font-bold text-balance text-foreground md:text-5xl">
                            One plan, everything included
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground">
                            No hidden fees. No complicated tiers. Just
                            everything you need.
                        </p>
                    </div>

                    {/* Pricing Card */}
                    <Card className="border-border bg-card">
                        <CardHeader className="pb-4">
                            <div className="mb-2 flex items-center gap-3">
                                <CardTitle className="text-2xl font-semibold text-card-foreground">
                                    {plan.name}
                                </CardTitle>
                                <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                                    Recommended
                                </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-bold text-card-foreground">
                                    ৳{plan.price}
                                </span>
                                <span className="text-muted-foreground">
                                    /month
                                </span>
                            </div>
                            <CardDescription className="pt-2 text-muted-foreground">
                                For individuals and teams who want the full
                                experience.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="pb-6">
                            <ul className="space-y-3">
                                {features.map((feature, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center gap-3"
                                    >
                                        <Check className="h-5 w-5 flex-shrink-0 text-primary" />
                                        <span className="text-card-foreground">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4 pt-2">
                            <form action={subscribe.url()} method="POST">
                                <input
                                    type="hidden"
                                    name="_token"
                                    value={props.csrf}
                                />
                                <Button
                                    type="submit"
                                    className="h-12 w-full text-base font-medium"
                                    // onClick={handleSubscribe}
                                    // disabled={isLoading}
                                >
                                    Subscribe Now
                                    {/*{isLoading ? "Processing..." : "Subscribe Now"}*/}
                                </Button>
                            </form>
                            <p className="text-center text-xs text-muted-foreground">
                                Cancel anytime. No questions asked.
                            </p>
                        </CardFooter>
                    </Card>

                    {/* Footer note */}
                    <p className="mt-8 text-center text-sm text-muted-foreground">
                        Secure payment powered by Stripe. Your card details are
                        never stored.
                    </p>
                </div>
            </main>
        </AppLayout>
    );
}
