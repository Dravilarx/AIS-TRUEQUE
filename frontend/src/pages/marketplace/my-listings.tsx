import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, Edit, Trash2, Eye, MoreVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArticleGridSkeleton } from '@/components/shared/skeleton';
import { useArticles } from '@/hooks/useArticles';
import { formatPrice, formatRelativeTime, cn } from '@/lib/utils';
import { Article, ArticleStatus } from '@/types';
import toast from 'react-hot-toast';

const statusConfig: Record<ArticleStatus, { label: string; color: string }> = {
    active: { label: 'Activo', color: 'bg-green-100 text-green-800' },
    reserved: { label: 'Reservado', color: 'bg-yellow-100 text-yellow-800' },
    sold: { label: 'Vendido', color: 'bg-blue-100 text-blue-800' },
    inactive: { label: 'Inactivo', color: 'bg-gray-100 text-gray-800' },
};

export function MyListingsPage() {
    const { myArticles, loading, fetchMyArticles, updateArticle, deleteArticle } = useArticles();
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    useEffect(() => {
        fetchMyArticles();
    }, []);

    const handleStatusChange = async (articleId: string, status: ArticleStatus) => {
        setActionLoading(articleId);
        try {
            await updateArticle(articleId, { status });
            toast.success(`Artículo marcado como ${statusConfig[status].label.toLowerCase()}`);
            fetchMyArticles();
        } catch (error) {
            toast.error('Error al actualizar estado');
        } finally {
            setActionLoading(null);
            setOpenMenu(null);
        }
    };

    const handleDelete = async (articleId: string) => {
        if (!confirm('¿Estás seguro de eliminar este artículo?')) return;

        setActionLoading(articleId);
        try {
            await deleteArticle(articleId);
            toast.success('Artículo eliminado');
            fetchMyArticles();
        } catch (error) {
            toast.error('Error al eliminar');
        } finally {
            setActionLoading(null);
        }
    };

    const activeCount = myArticles.filter(a => a.status === 'active').length;
    const soldCount = myArticles.filter(a => a.status === 'sold').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Mis publicaciones</h1>
                    <p className="text-muted-foreground">
                        {activeCount} activos · {soldCount} vendidos · {myArticles.length} total
                    </p>
                </div>

                <Link to="/marketplace/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva publicación
                    </Button>
                </Link>
            </div>

            {/* Listings */}
            {loading ? (
                <ArticleGridSkeleton count={4} />
            ) : myArticles.length > 0 ? (
                <div className="space-y-4">
                    {myArticles.map((article) => (
                        <Card key={article.id} className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex gap-4 p-4">
                                    {/* Image */}
                                    <Link
                                        to={`/marketplace/${article.id}`}
                                        className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-32 sm:w-32"
                                    >
                                        <img
                                            src={article.images[0]}
                                            alt={article.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </Link>

                                    {/* Info */}
                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <div className="flex items-start justify-between gap-2">
                                            <Link
                                                to={`/marketplace/${article.id}`}
                                                className="font-semibold hover:text-primary"
                                            >
                                                {article.title}
                                            </Link>

                                            {/* Status Badge */}
                                            <span className={cn(
                                                'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                                                statusConfig[article.status].color
                                            )}>
                                                {statusConfig[article.status].label}
                                            </span>
                                        </div>

                                        <p className="text-lg font-bold text-primary">
                                            {formatPrice(article.price)}
                                        </p>

                                        <div className="mt-auto flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Eye className="h-4 w-4" />
                                                {article.views}
                                            </span>
                                            <span>{formatRelativeTime(article.createdAt)}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex shrink-0 flex-col gap-2">
                                        <div className="relative">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setOpenMenu(openMenu === article.id ? null : article.id)}
                                                disabled={actionLoading === article.id}
                                            >
                                                {actionLoading === article.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <MoreVertical className="h-4 w-4" />
                                                )}
                                            </Button>

                                            {/* Dropdown Menu */}
                                            {openMenu === article.id && (
                                                <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border bg-background p-1 shadow-lg">
                                                    <Link
                                                        to={`/marketplace/edit/${article.id}`}
                                                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        Editar
                                                    </Link>

                                                    <div className="my-1 border-t" />

                                                    {article.status === 'active' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusChange(article.id, 'reserved')}
                                                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                                                            >
                                                                Marcar como reservado
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChange(article.id, 'sold')}
                                                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                                                            >
                                                                Marcar como vendido
                                                            </button>
                                                        </>
                                                    )}

                                                    {article.status === 'reserved' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusChange(article.id, 'active')}
                                                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                                                            >
                                                                Volver a activar
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChange(article.id, 'sold')}
                                                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                                                            >
                                                                Marcar como vendido
                                                            </button>
                                                        </>
                                                    )}

                                                    {article.status === 'sold' && (
                                                        <button
                                                            onClick={() => handleStatusChange(article.id, 'active')}
                                                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                                                        >
                                                            Republicar
                                                        </button>
                                                    )}

                                                    <div className="my-1 border-t" />

                                                    <button
                                                        onClick={() => handleDelete(article.id)}
                                                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Eliminar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center py-12">
                        <Package className="h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No tienes publicaciones</h3>
                        <p className="mt-1 text-center text-sm text-muted-foreground">
                            Publica tu primer artículo y empieza a vender
                        </p>
                        <Link to="/marketplace/new" className="mt-4">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Crear publicación
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
