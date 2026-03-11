import { Head, Link, useForm } from '@inertiajs/react';
import { DoorOpen } from 'lucide-react';
import type { FormEventHandler } from 'react';

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

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <GuestLayout>
            <Head title="Create account" />

            <div className="flex flex-col gap-6">
                {/* Logo / Brand header */}
                <div className="flex flex-col items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-foreground">
                        <DoorOpen className="size-5 text-background" />
                    </div>
                    <h1 className="text-lg font-semibold tracking-tight">
                        Create your account
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Get started with RoomBook
                    </p>
                </div>

                <Card>
                    <CardHeader className="sr-only">
                        <CardTitle>Register</CardTitle>
                        <CardDescription>
                            Fill in your details to create a new account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="flex flex-col gap-4">
                            {/* Name */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Your full name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    autoComplete="name"
                                    autoFocus
                                />
                                {errors.name && (
                                    <p className="text-xs text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

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
                                />
                                <p className="text-xs text-muted-foreground">
                                    Registration is limited to DIU email
                                    addresses.
                                </p>
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
                                    placeholder="Create a password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    autoComplete="new-password"
                                />
                                {errors.password && (
                                    <p className="text-xs text-destructive">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="password_confirmation">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    autoComplete="new-password"
                                />
                                {errors.password_confirmation && (
                                    <p className="text-xs text-destructive">
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing
                                    ? 'Creating account...'
                                    : 'Create account'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Login link */}
                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
