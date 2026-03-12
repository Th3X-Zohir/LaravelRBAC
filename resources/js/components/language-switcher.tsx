import { router } from '@inertiajs/react';
import { Languages } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n } from '@/lib/i18n';

export function LanguageSwitcher(): React.ReactNode {
    const { t, locale, availableLocales } = useI18n();

    function setLocale(newLocale: string): void {
        if (newLocale === locale) {
            return;
        }

        router.post('/locale', { locale: newLocale }, { preserveScroll: true });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground"
                        aria-label={t('common.language')}
                    >
                        <Languages className="size-4" />
                        <span className="sr-only">{t('common.language')}</span>
                    </Button>
                }
            ></DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8}>
                <DropdownMenuGroup>
                    <DropdownMenuLabel>
                        {t('common.language')}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {availableLocales.map((availableLocale) => (
                        <DropdownMenuItem
                            key={availableLocale.code}
                            onClick={() => setLocale(availableLocale.code)}
                        >
                            <span className="flex-1">
                                {availableLocale.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {availableLocale.code.toUpperCase()}
                            </span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
