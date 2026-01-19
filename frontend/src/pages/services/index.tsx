import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Briefcase, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ServiceCard } from '@/components/services/service-card';
import { Skeleton } from '@/components/shared/skeleton';
import { useServices } from '@/hooks/useServices';
import { useCategories } from '@/hooks/useCategories';
import { cn } from '@/lib/utils';

export function ServicesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { services, loading, fetchServices } = useServices();
    const { categories, loading: categoriesLoading } = useCategories('service');

    const [searchQuery, setSearchQuery] = useState('');
    const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

    const activeCategory = searchParams.get('category') || '';

    useEffect(() => {
        const filters: any = {};
        if (activeCategory) filters.category = activeCategory;
        if (showVerifiedOnly) filters.verified = true;

        fetchServices(filters);
    }, [activeCategory, showVerifiedOnly, fetchServices]);

    const updateCategory = (category: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (category) {
            newParams.set('category', category);
        } else {
            newParams.delete('category');
        }
        setSearchParams(newParams);
    };

    // Filter by search query (client-side)
    const filteredServices = services.filter((service) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            service.businessName.toLowerCase().includes(query) ||
            service.description.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Directorio de Servicios</h1>
                    <p className="text-muted-foreground">
                        {filteredServices.length} servicios disponibles
                    </p>
                </div>

                <Link to="/services/register">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Ofrecer servicio
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar servicios..."
                        className="pl-9"
                    />
                </div>

                <Button
                    variant={showVerifiedOnly ? 'default' : 'outline'}
                    onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verificados
                </Button>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => updateCategory('')}
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
                        onClick={() => updateCategory(cat.slug)}
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

            {/* Services Grid */}
            {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-0">
                                <Skeleton className="aspect-video" />
                                <div className="space-y-2 p-4">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filteredServices.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredServices.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center py-12">
                        <Briefcase className="h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No hay servicios</h3>
                        <p className="mt-1 text-center text-sm text-muted-foreground">
                            {activeCategory || showVerifiedOnly
                                ? 'Intenta ajustar los filtros'
                                : '¡Sé el primero en ofrecer tus servicios!'}
                        </p>
                        {(activeCategory || showVerifiedOnly) && (
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => {
                                    setSearchParams({});
                                    setShowVerifiedOnly(false);
                                }}
                            >
                                Limpiar filtros
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
