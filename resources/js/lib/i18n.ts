import { usePage } from '@inertiajs/react';

import type { AvailableLocale, Translations } from '@/types/global';

function getByDotPath(source: unknown, key: string): unknown {
    return key
        .split('.')
        .reduce<unknown>((current, segment) => {
            if (current === null || typeof current !== 'object') {
                return undefined;
            }

            return (current as Record<string, unknown>)[segment];
        }, source);
}

function replacePlaceholders(
    value: string,
    replacements: Record<string, string | number> = {},
): string {
    return Object.entries(replacements).reduce((result, [key, replacement]) => {
        return result.replaceAll(`:${key}`, String(replacement));
    }, value);
}

function choosePluralVariant(
    value: string,
    replacements: Record<string, string | number> = {},
): string {
    if (!value.includes('|')) {
        return value;
    }

    const count = replacements.count;

    if (typeof count !== 'number') {
        return value.split('|')[0] ?? value;
    }

    const [singular, plural] = value.split('|');

    return count === 1 ? (singular ?? value) : (plural ?? singular ?? value);
}

export function useI18n(): {
    t: (key: string, replacements?: Record<string, string | number>) => string;
    locale: string;
    availableLocales: AvailableLocale[];
    intlLocale: string;
} {
    const { translations, locale, availableLocales } = usePage().props as {
        translations: Translations;
        locale: string;
        availableLocales: AvailableLocale[];
    };

    const intlLocale = locale === 'bn' ? 'bn-BD' : 'en-US';

    function t(
        key: string,
        replacements?: Record<string, string | number>,
    ): string {
        const value = getByDotPath(translations, key);

        if (typeof value !== 'string') {
            return key;
        }

        const resolved = choosePluralVariant(value, replacements);

        return replacePlaceholders(resolved, replacements);
    }

    return { t, locale, availableLocales, intlLocale };
}

