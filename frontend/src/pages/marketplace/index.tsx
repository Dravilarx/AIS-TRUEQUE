import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Filter, X, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArticleCard } from '@/components/marketplace/article-card';
import { ArticleGridSkeleton } from '@/components/shared/skeleton';
import { useArticles } from '@/hooks/useArticles';
import { useCategories } from '@/hooks/useCategories';
import { ArticleCondition } from '@/types';
import { cn } from '@/lib/utils';

const conditions: { value: ArticleCondition | ''; label: string }[] = [
    { value: '', label: 'Todos los estados' },
    { value: 'new', label: 'Nuevo' },
    { value: 'like_new', label: 'Como nuevo' },
    { value: 'good', label: 'Buen estado' },
    { value: 'fair', label: 'Aceptable' },
];

const priceRanges = [
    { value: '', label: 'Cualquier precio' },
    { value: '0-5000', label: 'Hasta $5.000' },
    { value: '5000-15000', label: '$5.000 - $15.000' },
    { value: '15000-30000', label: '$15.000 - $30.000' },
    { value: '30000-50000', label: '$30.000 - $50.000' },
    { value: '50000+', label: 'Más de $50.000' },
];

export function MarketplacePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { articles, loading, fetchArticles, hasMore, loadMore } = useArticles();
    const { categories, loading: categoriesLoading } = useCategories('article');

    // Filter state from URL
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

    const activeCategory = searchParams.get('category') || '';
    const activeCondition = searchParams.get('condition') || '';
    const activePriceRange = searchParams.get('price') || '';

    // Fetch on filter change
    useEffect(() => {
        const filters: any = {};

        if (activeCategory) filters.category = activeCategory;
        if (activeCondition) filters.condition = activeCondition;

        if (activePriceRange) {
            const [min, max] = activePriceRange.split('-');
            if (min) filters.minPrice = parseInt(min);
            if (max && max !== '+') filters.maxPrice = parseInt(max);
        }

        fetchArticles(filters, true);
    }, [activeCategory, activeCondition, activePriceRange]);

    // Update URL params
    const updateFilter = (key: string, value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        setSearchParams(newParams);
    };

    const clearFilters = () => {
        setSearchParams({});
        setSearchQuery('');
    };

    // Filter articles by search query (client-side)
    const filteredArticles = useMemo(() => {
        if (!searchQuery.trim()) return articles;

        const query = searchQuery.toLowerCase();
        return articles.filter(article =>
            article.title.toLowerCase().includes(query) ||
            article.description.toLowerCase().includes(query)
        );
    }, [articles, searchQuery]);

    const hasActiveFilters = activeCategory || activeCondition || activePriceRange;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Marketplace</h1>
                    <p className="text-muted-foreground">
                        {filteredArticles.length} artículos disponibles
                    </p>
                </div>

                <Link to="/marketplace/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Publicar artículo
                    </Button>
                </Link>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar artículos..."
                        className="pl-9"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(showFilters && 'bg-muted')}
                >
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filtros
                    {hasActiveFilters && (
                        <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                            {[activeCategory, activeCondition, activePriceRange].filter(Boolean).length}
                        </span>
                    )}
                </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <Card>
                    <CardContent className="grid gap-4 p-4 sm:grid-cols-3">
                        {/* Category Filter */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Categoría</label>
                            <select
                                value={activeCategory}
                                onChange={(e) => updateFilter('category', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Todas las categorías</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.slug}>
                                        {cat.icon} {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Condition Filter */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Estado</label>
                            <select
                                value={activeCondition}
                                onChange={(e) => updateFilter('condition', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                {conditions.map((cond) => (
                                    <option key={cond.value} value={cond.value}>
                                        {cond.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Price Filter */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Precio</label>
                            <select
                                value={activePriceRange}
                                onChange={(e) => updateFilter('price', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                {priceRanges.map((range) => (
                                    <option key={range.value} value={range.value}>
                                        {range.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </CardContent>

                    {hasActiveFilters && (
                        <div className="border-t px-4 py-3">
                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                                <X className="mr-2 h-4 w-4" />
                                Limpiar filtros
                            </Button>
                        </div>
                    )}
                </Card>
            )}

            {/* Category Pills (Quick Filter) */}
            {!showFilters && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => updateFilter('category', '')}
                        className={cn(
                            'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                            !activeCategory
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                        )}
                    >
                        Todos
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => updateFilter('category', cat.slug)}
                            className={cn(
                                'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                                activeCategory === cat.slug
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted hover:bg-muted/80'
                            )}
                        >
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Articles Grid */}
            {loading && articles.length === 0 ? (
                <ArticleGridSkeleton count={8} />
            ) : filteredArticles.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {filteredArticles.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>

                    {/* Load More */}
                    {hasMore && (
                        <div className="flex justify-center pt-4">
                            <Button
                                variant="outline"
                                onClick={() => loadMore()}
                                disabled={loading}
                            >
                                {loading ? 'Cargando...' : 'Cargar más'}
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center py-12">
                        <Filter className="h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No se encontraron artículos</h3>
                        <p className="mt-1 text-center text-sm text-muted-foreground">
                            {hasActiveFilters || searchQuery
                                ? 'Intenta ajustar los filtros o la búsqueda'
                                : 'Sé el primero en publicar un artículo'}
                        </p>
                        {(hasActiveFilters || searchQuery) && (
                            <Button variant="outline" className="mt-4" onClick={clearFilters}>
                                Limpiar filtros
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
