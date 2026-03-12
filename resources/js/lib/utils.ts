import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function resolveIntlLocale(locale: string | undefined): string {
    if (locale === 'bn') {
        return 'bn-BD';
    }

    return 'en-US';
}

export function formatNumber(value: number, locale?: string): string {
    return new Intl.NumberFormat(resolveIntlLocale(locale)).format(value);
}

export function localizeDigits(value: string, locale?: string): string {
    if (locale !== 'bn') {
        return value;
    }

    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

    return value.replace(/[0-9]/g, (digit) => bnDigits[Number(digit)]);
}

export function formatDate(value: string, locale?: string): string {
    if (!value) {
        return '';
    }

    const date = value.includes('T') || value.includes('Z')
        ? new Date(value)
        : new Date(`${value}T12:00:00`);

    return new Intl.DateTimeFormat(resolveIntlLocale(locale), {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

export function formatDateTime(value: string, locale?: string): string {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    return new Intl.DateTimeFormat(resolveIntlLocale(locale), {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

export function formatTime(value: string, locale?: string): string {
    if (!value) {
        return '';
    }

    const [hours = '00', minutes = '00'] = value.split(':');
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return new Intl.DateTimeFormat(resolveIntlLocale(locale), {
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}
