import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(value: string): string {
    if (!value) {
        return '';
    }

    // Handle both full ISO strings and YYYY-MM-DD date strings
    const date =
        value.includes('T') || value.includes('Z')
            ? parseISO(value)
            : parseISO(`${value}T12:00:00`);

    return format(date, 'd MMM yyyy');
}

export function formatDateTime(value: string): string {
    if (!value) {
        return '';
    }

    return format(parseISO(value), 'd MMM yyyy');
}

export function formatTime(value: string): string {
    if (!value) {
        return '';
    }

    const [hours = '00', minutes = '00'] = value.split(':');
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);
    return format(date, 'h:mm a');
}
