import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format currency to CLP
 */
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
    }).format(price);
}

/**
 * Format relative time (e.g., "hace 2 días")
 * Handles Date, Firestore Timestamp, and raw timestamp objects
 */
export function formatRelativeTime(dateInput: unknown): string {
    if (!dateInput) return 'Fecha no disponible';

    let date: Date;

    // Handle different input types
    if (dateInput instanceof Date) {
        date = dateInput;
    } else if (typeof dateInput === 'object' && dateInput !== null) {
        const obj = dateInput as { toDate?: () => Date; seconds?: number };
        if (typeof obj.toDate === 'function') {
            // Firestore Timestamp
            date = obj.toDate();
        } else if (typeof obj.seconds === 'number') {
            // Raw Firestore timestamp object
            date = new Date(obj.seconds * 1000);
        } else {
            return 'Fecha inválida';
        }
    } else {
        return 'Fecha inválida';
    }

    const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'hace un momento';
    if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    if (diffInSeconds < 2592000) return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}
