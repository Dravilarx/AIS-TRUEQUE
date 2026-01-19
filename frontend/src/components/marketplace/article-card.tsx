import { Link } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatPrice, formatRelativeTime } from '@/lib/utils';
import type { Article, ArticleWithSeller } from '@/types';

interface ArticleCardProps {
    article: Article | ArticleWithSeller;
    className?: string;
}

const conditionLabels: Record<Article['condition'], string> = {
    new: 'Nuevo',
    like_new: 'Como nuevo',
    good: 'Buen estado',
    fair: 'Usado',
};

const conditionColors: Record<Article['condition'], string> = {
    new: 'bg-green-100 text-green-800',
    like_new: 'bg-blue-100 text-blue-800',
    good: 'bg-yellow-100 text-yellow-800',
    fair: 'bg-gray-100 text-gray-800',
};

export function ArticleCard({ article, className }: ArticleCardProps) {
    return (
        <Link to={`/marketplace/${article.id}`}>
            <Card
                className={cn(
                    'group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1',
                    className
                )}
            >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                    {article.images[0] ? (
                        <img
                            src={article.images[0]}
                            alt={article.title}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            Sin imagen
                        </div>
                    )}

                    {/* Status badges */}
                    {article.status === 'reserved' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <span className="rounded-full bg-yellow-500 px-3 py-1 text-sm font-medium text-white">
                                Reservado
                            </span>
                        </div>
                    )}

                    {article.status === 'sold' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-medium text-white">
                                Vendido
                            </span>
                        </div>
                    )}

                    {/* Condition badge */}
                    <span
                        className={cn(
                            'absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium',
                            conditionColors[article.condition]
                        )}
                    >
                        {conditionLabels[article.condition]}
                    </span>

                    {/* Favorite button */}
                    <button
                        className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => {
                            e.preventDefault();
                            // TODO: Toggle favorite
                        }}
                    >
                        <Heart className="h-4 w-4 text-gray-600" />
                    </button>
                </div>

                <CardContent className="p-3">
                    {/* Title */}
                    <h3 className="line-clamp-2 font-medium text-foreground">
                        {article.title}
                    </h3>

                    {/* Price */}
                    <p className="mt-1 text-lg font-bold text-primary">
                        {formatPrice(article.price)}
                        {article.priceNegotiable && (
                            <span className="ml-1 text-xs font-normal text-muted-foreground">
                                (negociable)
                            </span>
                        )}
                    </p>

                    {/* Metadata */}
                    {(article.metadata.grade || article.metadata.size) && (
                        <div className="mt-1 flex flex-wrap gap-1">
                            {article.metadata.grade && (
                                <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                    {article.metadata.grade}
                                </span>
                            )}
                            {article.metadata.size && (
                                <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                    Talla {article.metadata.size}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Stats */}
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatRelativeTime(article.createdAt.toDate())}</span>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-0.5">
                                <Eye className="h-3 w-3" />
                                {article.views}
                            </span>
                            <span className="flex items-center gap-0.5">
                                <Heart className="h-3 w-3" />
                                {article.favorites}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
