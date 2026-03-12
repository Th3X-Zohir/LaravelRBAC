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

export default function Login() {
    const { t } = useI18n();
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
            <Head title={t('auth.log_in')} />

            <div className="flex flex-col gap-6">
                {/* Logo / Brand header */}
                <div className="flex flex-col items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-foreground">
                        <DoorOpen className="size-5 text-background" />
                    </div>
                    <h1 className="text-lg font-semibold tracking-tight">
                        {t('auth.welcome_back')}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t('auth.sign_in_subtitle')}
                    </p>
                </div>

                <Card>
                    <CardHeader className="sr-only">
                        <CardTitle>{t('auth.log_in')}</CardTitle>
                        <CardDescription>
                            {t('auth.credentials_hint')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="flex flex-col gap-4">
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
                                <Label htmlFor="password">
                                    {t('auth.password')}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder={t('auth.password_placeholder')}
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
                                    {t('auth.remember_me')}
                                </Label>
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing
                                    ? t('auth.signing_in')
                                    : t('auth.sign_in')}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Register link */}
                <p className="text-center text-sm text-muted-foreground">
                    {t('auth.dont_have_account')}{' '}
                    <Link
                        href={registerShow.url()}
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                        {t('auth.create_account')}
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
