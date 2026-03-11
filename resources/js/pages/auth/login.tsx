import { Head, Link, useForm } from '@inertiajs/react';
import { DoorOpen } from 'lucide-react';
import type { FormEventHandler } from 'react';

import { show as loginShow } from '@/actions/App/Http/Controllers/Auth/LoginController';
import { show as registerShow } from '@/actions/App/Http/Controllers/Auth/RegisterController';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GuestLayout from '@/layouts/guest-layout';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(loginShow.url());
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="flex flex-col gap-6">
                {/* Logo / Brand header */}
                <div className="flex flex-col items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-foreground">
                        <DoorOpen className="size-5 text-background" />
                    </div>
                    <h1 className="text-lg font-semibold tracking-tight">
                        Welcome back
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Sign in to your RoomBook account
                    </p>
                </div>

                <Card>
                    <CardHeader className="sr-only">
                        <CardTitle>Log in</CardTitle>
                        <CardDescription>
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="flex flex-col gap-4">
                            {/* Email */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@diu.edu.bd"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    autoComplete="email"
                                    autoFocus
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    autoComplete="current-password"
                                />
                                {errors.password && (
                                    <p className="text-xs text-destructive">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData('remember', e.target.checked)
                                    }
                                    className="size-3.5 rounded border-border accent-foreground"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-xs font-normal text-muted-foreground"
                                >
                                    Remember me
                                </Label>
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Register link */}
                <p className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link
                        href={registerShow.url()}
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                        Create an account
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
