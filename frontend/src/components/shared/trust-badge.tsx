import { ShieldCheck, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from '@/types';

interface TrustBadgeProps {
    tier?: User['accountTier'];
    className?: string;
    showLabel?: boolean;
}

export function TrustBadge({ tier, className, showLabel = false }: TrustBadgeProps) {
    if (!tier || tier === 'free') return null;

    if (tier === 'verified') {
        return (
            <div className={cn("inline-flex items-center gap-1.5 group relative", className)}>
                <ShieldCheck className="h-4 w-4 text-green-600" />
                {showLabel && <span className="text-xs font-medium text-green-700">Vecino Validado</span>}
                {!showLabel && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-[10px] font-semibold rounded whitespace-nowrap opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 z-50">
                        Vecino Validado
                    </div>
                )}
            </div>
        );
    }

    if (tier === 'business') {
        return (
            <div className={cn("inline-flex items-center gap-1.5 group relative", className)}>
                <Store className="h-4 w-4 text-blue-600 drop-shadow-[0_0_2px_rgba(37,99,235,0.4)]" />
                {showLabel && <span className="text-xs font-bold text-blue-700">Negocio Local</span>}
                {!showLabel && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-blue-900 text-blue-50 border border-blue-700 text-[10px] font-bold rounded whitespace-nowrap opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 z-50">
                        Negocio Local B2C
                    </div>
                )}
            </div>
        );
    }

    return null;
}
