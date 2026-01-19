import { Link } from 'react-router-dom';
import { ShoppingBag, Briefcase, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArticleCard } from '@/components/marketplace/article-card';
import { ArticleGridSkeleton, Skeleton } from '@/components/shared/skeleton';
import { useArticles } from '@/hooks/useArticles';
import { useCategories } from '@/hooks/useCategories';
import { useEffect } from 'react';

const stats = [
    { label: 'Familias activas', value: '487', icon: Users },
    { label: 'Artículos publicados', value: '1,234', icon: ShoppingBag },
    { label: 'Servicios disponibles', value: '56', icon: Briefcase },
    { label: 'Transacciones este mes', value: '189', icon: TrendingUp },
];

export function HomePage() {
    const { articles, loading: articlesLoading, fetchArticles } = useArticles();
    const { categories, loading: categoriesLoading } = useCategories('article');

    useEffect(() => {
        fetchArticles({}, true);
    }, []);

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 text-white sm:p-8 lg:p-12">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                        Compra, vende e intercambia
                        <br />
                        <span className="text-primary-foreground/90">en nuestra comunidad</span>
                    </h1>
                    <p className="mt-4 text-lg text-primary-foreground/80">
                        Un marketplace exclusivo para familias del colegio. Encuentra uniformes,
                        libros, útiles y servicios de confianza.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link to="/marketplace">
                            <Button size="lg" variant="secondary">
                                <ShoppingBag className="mr-2 h-5 w-5" />
                                Explorar Marketplace
                            </Button>
                        </Link>
                        <Link to="/marketplace/new">
                            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                                Publicar Artículo
                            </Button>
                        </Link>
                    </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                <div className="absolute -bottom-10 right-20 h-32 w-32 rounded-full bg-white/5" />
            </section>

            {/* Stats */}
            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.label}>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="rounded-full bg-primary/10 p-3">
                                <stat.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </section>


            {/* Categories */}
            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Categorías</h2>
                    <Link to="/marketplace" className="text-sm text-primary hover:underline">
                        Ver todas
                    </Link>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {categoriesLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 rounded-xl" />
                        ))
                    ) : (
                        categories.map((cat) => (
                            <Link
                                key={cat.id}
                                to={`/marketplace?category=${cat.slug}`}
                                className={`flex flex-col items-center gap-2 rounded-xl ${cat.color} p-4 transition-transform hover:scale-105`}
                            >
                                <span className="text-3xl">{cat.icon}</span>
                                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                            </Link>
                        ))
                    )}
                </div>
            </section>

            {/* Recent Articles */}
            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Publicaciones recientes</h2>
                    <Link
                        to="/marketplace"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                        Ver más <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {articlesLoading ? (
                    <ArticleGridSkeleton count={4} />
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {articles.slice(0, 8).map((article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                )}

                {!articlesLoading && articles.length === 0 && (
                    <div className="rounded-lg border-2 border-dashed p-8 text-center">
                        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No hay artículos aún</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            ¡Sé el primero en publicar un artículo!
                        </p>
                        <Link to="/marketplace/new" className="mt-4 inline-block">
                            <Button>Publicar Artículo</Button>
                        </Link>
                    </div>
                )}
            </section>
        </div>
    );
}
