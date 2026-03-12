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
import { useI18n } from '@/lib/i18n';

export default function Register() {
    const { t } = useI18n();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(registerShow.url());
    };

    return (
        <GuestLayout>
            <Head title={t('auth.create_account')} />

            <div className="flex flex-col gap-6">
                {/* Logo / Brand header */}
                <div className="flex flex-col items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-foreground">
                        <DoorOpen className="size-5 text-background" />
                    </div>
                    <h1 className="text-lg font-semibold tracking-tight">
                        {t('auth.create_your_account')}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t('auth.get_started')}
                    </p>
                </div>

                <Card>
                    <CardHeader className="sr-only">
                        <CardTitle>{t('auth.register')}</CardTitle>
                        <CardDescription>
                            {t('auth.register_hint')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="flex flex-col gap-4">
                            {/* Name */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="name">{t('auth.name')}</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder={t('auth.name_placeholder')}
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
                                <Label htmlFor="email">{t('auth.email')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={t('auth.email_placeholder')}
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    autoComplete="email"
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t('auth.diu_email_hint')}
                                </p>
                                {errors.email && (
                                    <p className="text-xs text-destructive">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="password">
                                    {t('auth.password')}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder={t(
                                        'auth.password_create_placeholder',
                                    )}
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
                                    {t('auth.confirm_password')}
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    placeholder={t(
                                        'auth.confirm_password_placeholder',
                                    )}
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
                                    ? t('auth.creating_account')
                                    : t('auth.create_account')}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Login link */}
                <p className="text-center text-sm text-muted-foreground">
                    {t('auth.already_have_account')}{' '}
                    <Link
                        href={loginShow.url()}
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                        {t('auth.sign_in')}
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
