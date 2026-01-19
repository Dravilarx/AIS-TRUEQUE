import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Heart, Share2, MessageCircle, Edit, Trash2,
    Eye, Clock, MapPin, Tag, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from '@/components/shared/star-rating';
import { useArticles } from '@/hooks/useArticles';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, formatRelativeTime, cn } from '@/lib/utils';
import { ArticleCondition } from '@/types';
import toast from 'react-hot-toast';

const conditionLabels: Record<ArticleCondition, { label: string; color: string }> = {
    new: { label: 'Nuevo', color: 'bg-green-100 text-green-800' },
    like_new: { label: 'Como nuevo', color: 'bg-blue-100 text-blue-800' },
    good: { label: 'Buen estado', color: 'bg-yellow-100 text-yellow-800' },
    fair: { label: 'Aceptable', color: 'bg-gray-100 text-gray-800' },
};

export function ArticleDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { getArticle, deleteArticle, loading } = useArticles();

    const [article, setArticle] = useState<any>(null);
    const [currentImage, setCurrentImage] = useState(0);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (id) {
            loadArticle(id);
        }
    }, [id]);

    const loadArticle = async (articleId: string) => {
        const data = await getArticle(articleId);
        if (data) {
            setArticle(data);
        } else {
            toast.error('Artículo no encontrado');
            navigate('/marketplace');
        }
    };

    const handlePrevImage = () => {
        setCurrentImage((prev) =>
            prev === 0 ? article.images.length - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImage((prev) =>
            prev === article.images.length - 1 ? 0 : prev + 1
        );
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: article.title,
                    text: `Mira este artículo: ${article.title}`,
                    url: window.location.href,
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success('Enlace copiado al portapapeles');
            }
        } catch (error) {
            // User cancelled or error
        }
    };

    const handleContact = () => {
        // TODO: Implement chat/messaging
        toast.success('Función de mensajes próximamente');
    };

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de eliminar este artículo?')) return;

        setDeleting(true);
        try {
            await deleteArticle(id!);
            toast.success('Artículo eliminado');
            navigate('/marketplace/my-listings');
        } catch (error) {
            toast.error('Error al eliminar');
        } finally {
            setDeleting(false);
        }
    };

    if (loading || !article) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const isOwner = user?.uid === article.sellerId;
    const condition = conditionLabels[article.condition as ArticleCondition];

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
            </Button>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Image Gallery */}
                <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                        <img
                            src={article.images[currentImage]}
                            alt={`${article.title} - Imagen ${currentImage + 1}`}
                            className="h-full w-full object-cover"
                        />

                        {/* Navigation Arrows */}
                        {article.images.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevImage}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md hover:bg-white"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={handleNextImage}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md hover:bg-white"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </>
                        )}

                        {/* Status Badge */}
                        {article.status !== 'active' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <span className="rounded-full bg-white px-4 py-2 font-semibold">
                                    {article.status === 'reserved' ? 'Reservado' : 'Vendido'}
                                </span>
                            </div>
                        )}

                        {/* Image Counter */}
                        <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                            {currentImage + 1} / {article.images.length}
                        </div>
                    </div>

                    {/* Thumbnails */}
                    {article.images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {article.images.map((img: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImage(idx)}
                                    className={cn(
                                        'h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                                        currentImage === idx ? 'border-primary' : 'border-transparent'
                                    )}
                                >
                                    <img
                                        src={img}
                                        alt={`Thumbnail ${idx + 1}`}
                                        className="h-full w-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Article Info */}
                <div className="space-y-6">
                    {/* Title & Price */}
                    <div>
                        <div className="flex items-start justify-between gap-4">
                            <h1 className="text-2xl font-bold">{article.title}</h1>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={handleShare}>
                                    <Share2 className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <Heart className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-primary">
                                {formatPrice(article.price)}
                            </span>
                            {article.priceNegotiable && (
                                <span className="text-sm text-muted-foreground">
                                    (Negociable)
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                        <span className={cn('rounded-full px-3 py-1 text-sm font-medium', condition.color)}>
                            {condition.label}
                        </span>
                        {article.metadata?.grade && (
                            <span className="rounded-full bg-muted px-3 py-1 text-sm">
                                📚 {article.metadata.grade}
                            </span>
                        )}
                        {article.metadata?.size && (
                            <span className="rounded-full bg-muted px-3 py-1 text-sm">
                                📏 Talla {article.metadata.size}
                            </span>
                        )}
                        {article.metadata?.brand && (
                            <span className="rounded-full bg-muted px-3 py-1 text-sm">
                                <Tag className="mr-1 inline h-3 w-3" />
                                {article.metadata.brand}
                            </span>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {article.views} vistas
                        </span>
                        <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {article.favorites} favoritos
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatRelativeTime(article.createdAt)}
                        </span>
                    </div>

                    {/* Description */}
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="mb-2 font-semibold">Descripción</h3>
                            <p className="whitespace-pre-wrap text-muted-foreground">
                                {article.description}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Seller Info */}
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="mb-3 font-semibold">Vendedor</h3>
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                                    {article.seller?.displayName?.[0] || 'U'}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">
                                        {article.seller?.displayName || 'Usuario'}
                                    </p>
                                    {article.seller?.stats && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <StarRating rating={article.seller.stats.averageRating} size="sm" />
                                            <span>({article.seller.stats.ratingsCount} reseñas)</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {isOwner ? (
                            <>
                                <Link to={`/marketplace/edit/${article.id}`} className="flex-1">
                                    <Button variant="outline" className="w-full">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                    </Button>
                                </Link>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                >
                                    {deleting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </Button>
                            </>
                        ) : (
                            <Button className="flex-1" onClick={handleContact}>
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Contactar vendedor
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
