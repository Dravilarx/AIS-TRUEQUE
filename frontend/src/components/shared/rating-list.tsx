import { ThumbsUp, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from '@/components/shared/star-rating';
import { Rating } from '@/types';
import { formatRelativeTime, cn } from '@/lib/utils';

interface RatingListProps {
    ratings: Rating[];
    loading?: boolean;
}

export function RatingList({ ratings, loading = false }: RatingListProps) {
    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-muted" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-24 rounded bg-muted" />
                                    <div className="h-3 w-20 rounded bg-muted" />
                                    <div className="h-12 w-full rounded bg-muted" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (ratings.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center">
                    <Star className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">
                        Aún no hay calificaciones
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {ratings.map((rating) => (
                <Card key={rating.id}>
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                {rating.reviewerName?.[0]?.toUpperCase() || 'U'}
                            </div>

                            <div className="min-w-0 flex-1">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-medium">{rating.reviewerName}</p>
                                        <div className="flex items-center gap-2">
                                            <StarRating rating={rating.score.overall} size="sm" />
                                            <span className="text-xs text-muted-foreground">
                                                {formatRelativeTime(rating.createdAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {rating.recommend && (
                                        <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                            <ThumbsUp className="h-3 w-3" />
                                            Recomienda
                                        </span>
                                    )}
                                </div>

                                {/* Comment */}
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {rating.comment}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

interface RatingSummaryProps {
    averageRating: number;
    totalRatings: number;
    recommendations: number;
    distribution: Record<number, number>;
}

export function RatingSummary({
    averageRating,
    totalRatings,
    recommendations,
    distribution,
}: RatingSummaryProps) {
    const maxCount = Math.max(...Object.values(distribution), 1);

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex gap-6">
                    {/* Average */}
                    <div className="text-center">
                        <p className="text-4xl font-bold">{averageRating.toFixed(1)}</p>
                        <StarRating rating={averageRating} size="sm" />
                        <p className="mt-1 text-sm text-muted-foreground">
                            {totalRatings} {totalRatings === 1 ? 'reseña' : 'reseñas'}
                        </p>
                        {recommendations > 0 && (
                            <p className="mt-1 text-xs text-green-600">
                                {recommendations} recomendaciones
                            </p>
                        )}
                    </div>

                    {/* Distribution */}
                    <div className="flex-1 space-y-1">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = distribution[star] || 0;
                            const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;

                            return (
                                <div key={star} className="flex items-center gap-2">
                                    <span className="w-3 text-xs text-muted-foreground">{star}</span>
                                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-yellow-400 transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="w-8 text-right text-xs text-muted-foreground">
                                        {count}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
