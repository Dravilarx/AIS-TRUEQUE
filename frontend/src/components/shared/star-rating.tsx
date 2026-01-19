import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RatingScore } from '@/types';

interface StarRatingProps {
    rating: number;
    maxRating?: RatingScore;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
    interactive?: boolean;
    onChange?: (rating: RatingScore) => void;
}

const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
};

export function StarRating({
    rating,
    maxRating = 5,
    size = 'md',
    showValue = false,
    interactive = false,
    onChange,
}: StarRatingProps) {
    const handleClick = (value: RatingScore) => {
        if (interactive && onChange) {
            onChange(value);
        }
    };

    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: maxRating }).map((_, index) => {
                const value = (index + 1) as RatingScore;
                const isFilled = index < Math.floor(rating);
                const isHalf = index === Math.floor(rating) && rating % 1 >= 0.5;

                return (
                    <button
                        key={index}
                        type="button"
                        disabled={!interactive}
                        onClick={() => handleClick(value)}
                        className={cn(
                            'transition-colors',
                            interactive && 'cursor-pointer hover:scale-110',
                            !interactive && 'cursor-default'
                        )}
                    >
                        <Star
                            className={cn(
                                sizeClasses[size],
                                isFilled || isHalf
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-none text-muted-foreground'
                            )}
                        />
                    </button>
                );
            })}
            {showValue && (
                <span className="ml-1 text-sm text-muted-foreground">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}
