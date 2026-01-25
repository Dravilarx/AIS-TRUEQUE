import { Link } from 'react-router-dom';
import { ShoppingBag, Briefcase, TrendingUp, Users, ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArticleCard } from '@/components/marketplace/article-card';
import { ServiceCard } from '@/components/services/service-card';
import { ArticleGridSkeleton, Skeleton } from '@/components/shared/skeleton';
import { useArticles } from '@/hooks/useArticles';
import { useServices } from '@/hooks/useServices';
import { useCategories } from '@/hooks/useCategories';
import { useEffect } from 'react';

const stats = [
    { label: 'Familias activas', value: '150+', icon: Users },
    { label: 'Productos', value: '300+', icon: ShoppingBag },
    { label: 'Servicios', value: '45+', icon: Briefcase },
    { label: 'Intercambios', value: '80+', icon: TrendingUp },
];

export function HomePage() {
    const { articles, loading: articlesLoading, fetchArticles } = useArticles();
    const { services, loading: servicesLoading, fetchServices } = useServices();
    const { categories, loading: categoriesLoading } = useCategories('article');

    useEffect(() => {
        fetchArticles({}, true);
        fetchServices({});
    }, [fetchArticles, fetchServices]);

    return (
        <div className="space-y-12 pb-12">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-white shadow-2xl transition-all hover:shadow-primary/20 sm:p-12">
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                        </span>
                        Marketplace para nuestra comunidad escolar
                    </div>
                    <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                        Compra, vende e intercambia
                        <br />
                        <span className="text-white/80 font-light">con confianza.</span>
                    </h1>
                    <p className="mt-6 text-lg text-primary-foreground/80 leading-relaxed">
                        Encuentra uniformes, libros y servicios ofrecidos por otras familias del colegio.
                        Ahorra, ayuda al planeta y fortalece nuestra comunidad.
                    </p>
                    <div className="mt-10 flex flex-wrap gap-4">
                        <Link to="/marketplace">
                            <Button size="lg" variant="secondary" className="h-12 px-8 font-bold shadow-lg transition-transform hover:scale-105 active:scale-95">
                                <ShoppingBag className="mr-2 h-5 w-5" />
                                Ver Marketplace
                            </Button>
                        </Link>
                        <Link to="/marketplace/new">
                            <Button size="lg" variant="outline" className="h-12 border-white/30 text-white hover:bg-white/10 px-8">
                                Publicar algo
                            </Button>
                        </Link>
                    </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-primary-foreground/5 blur-3xl" />
            </section>

            {/* Stats */}
            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-none bg-muted/50 transition-colors hover:bg-muted">
                        <CardContent className="flex flex-col items-center justify-center gap-2 p-6 text-center">
                            <div className="rounded-2xl bg-primary/10 p-4 mb-2">
                                <stat.icon className="h-6 w-6 text-primary" />
                            </div>
                            <p className="text-3xl font-black tracking-tight">{stat.value}</p>
                            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </section>

            {/* Categories */}
            <section>
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Categorías populares</h2>
                        <p className="text-sm text-muted-foreground">¿Qué estás buscando hoy?</p>
                    </div>
                    <Link to="/marketplace" className="text-sm font-semibold text-primary hover:underline">
                        Ver todas
                    </Link>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    {categoriesLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-28 rounded-2xl" />
                        ))
                    ) : (
                        categories.map((cat) => (
                            <Link
                                key={cat.id}
                                to={`/marketplace?category=${cat.slug}`}
                                className={`group flex flex-col items-center gap-3 rounded-2xl ${cat.color} p-6 transition-all hover:scale-105 hover:shadow-lg`}
                            >
                                <span className="text-4xl transition-transform group-hover:scale-110">{cat.icon}</span>
                                <span className="text-sm font-bold text-gray-800">{cat.name}</span>
                            </Link>
                        ))
                    )}
                </div>
            </section>

            <div className="grid gap-12 lg:grid-cols-3">
                {/* Recent Articles */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">Recién llegados</h2>
                        <Link to="/marketplace" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                            Ver más <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {articlesLoading ? (
                        <ArticleGridSkeleton count={4} />
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {articles.slice(0, 4).map((article) => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>
                    )}

                    {!articlesLoading && articles.length === 0 && (
                        <Card className="border-dashed py-12">
                            <CardContent className="flex flex-col items-center justify-center text-center">
                                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">No hay artículos aún</h3>
                                <p className="text-sm text-muted-foreground mb-6">¡Sé la primera familia en publicar!</p>
                                <Link to="/marketplace/new">
                                    <Button>Publicar ahora</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Top Services */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">Servicios destacados</h2>
                        <Link to="/services" className="text-sm font-semibold text-primary hover:underline">
                            Ver todos
                        </Link>
                    </div>

                    {servicesLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-48 rounded-xl" />
                            <Skeleton className="h-48 rounded-xl" />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {services.slice(0, 3).map((service) => (
                                <ServiceCard key={service.id} service={service} />
                            ))}
                        </div>
                    )}

                    {!servicesLoading && services.length === 0 && (
                        <Card className="bg-muted/30 p-8 text-center border-none">
                            <Briefcase className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground italic">¿Ofreces clases, transporte u otro servicio? Inscríbete.</p>
                            <Link to="/services/register" className="mt-4 inline-block">
                                <Button variant="outline" size="sm">Registrar mi servicio</Button>
                            </Link>
                        </Card>
                    )}
                </div>
            </div>

            {/* Trust Banner */}
            <section className="rounded-3xl bg-secondary/30 p-8 lg:p-12">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                    <div className="flex-1 space-y-4 text-center lg:text-left">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Heart className="h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Una comunidad, mil ahorros</h2>
                        <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                            AIS Trueque nace para facilitar la vida de los padres. Reutilizar no solo es bueno para el bolsillo, sino también para enseñar sostenibilidad a nuestros hijos.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
