import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Phone, Mail, MessageCircle, Star, CheckCircle,
    Clock, Edit, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from '@/components/shared/star-rating';
import { RatingForm } from '@/components/shared/rating-form';
import { RatingList, RatingSummary } from '@/components/shared/rating-list';
import { useServices } from '@/hooks/useServices';
import { useRatings } from '@/hooks/useRatings';
import { useAuth } from '@/hooks/useAuth';
import { ServiceProvider } from '@/types';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const categoryLabels: Record<string, string> = {
    tutoring: 'Clases Particulares',
    transport: 'Transporte Escolar',
    catering: 'Colaciones/Almuerzos',
    events: 'Eventos/Cumpleaños',
    repairs: 'Reparaciones',
    other: 'Otros',
};

export function ServiceDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { getService, loading } = useServices();
    const {
        ratings,
        fetchRatings,
        hasUserRated,
        createRating,
        getRatingSummary,
        loading: ratingsLoading
    } = useRatings();

    const [service, setService] = useState<ServiceProvider | null>(null);
    const [currentImage, setCurrentImage] = useState(0);
    const [showRatingForm, setShowRatingForm] = useState(false);
    const [canRate, setCanRate] = useState(false);
    const [ratingSummary, setRatingSummary] = useState<any>(null);

    useEffect(() => {
        if (id) {
            loadService(id);
            loadRatings(id);
        }
    }, [id]);

    const loadService = async (serviceId: string) => {
        const data = await getService(serviceId);
        if (data) {
            setService(data);
        } else {
            toast.error('Servicio no encontrado');
            navigate('/services');
        }
    };

    const loadRatings = async (serviceId: string) => {
        await fetchRatings(serviceId, 'service');
        const summary = await getRatingSummary(serviceId, 'service');
        setRatingSummary(summary);

        if (user) {
            const hasRated = await hasUserRated(serviceId, 'service');
            setCanRate(!hasRated);
        }
    };

    const handleWhatsApp = () => {
        if (service?.contact.whatsapp) {
            const phone = service.contact.whatsapp.replace(/\D/g, '');
            window.open(`https://wa.me/${phone}`, '_blank');
        }
    };

    const handleCall = () => {
        if (service?.contact.phone) {
            window.location.href = `tel:${service.contact.phone}`;
        }
    };

    const handleEmail = () => {
        if (service?.contact.email) {
            window.location.href = `mailto:${service.contact.email}`;
        }
    };

    const handleRatingSubmit = async (data: {
        score: { overall: number };
        comment: string;
        recommend: boolean;
    }) => {
        if (!id) return false;

        const success = await createRating(id, 'service', data);
        if (success) {
            setShowRatingForm(false);
            setCanRate(false);
            loadRatings(id);
        }
        return success;
    };

    if (loading || !service) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const isOwner = user?.uid === service.userId;
    const isVerified = service.verification?.status === 'verified';

    return (
        <div className="space-y-6">
            {/* Back */}
            <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
            </Button>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Images */}
                <div className="space-y-4">
                    {service.images && service.images.length > 0 ? (
                        <>
                            <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
                                <img
                                    src={service.images[currentImage]}
                                    alt={service.businessName}
                                    className="h-full w-full object-cover"
                                />

                                {service.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setCurrentImage(i => i === 0 ? service.images!.length - 1 : i - 1)}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => setCurrentImage(i => i === service.images!.length - 1 ? 0 : i + 1)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </>
                                )}

                                <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                                    {currentImage + 1} / {service.images.length}
                                </div>
                            </div>

                            {service.images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {service.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImage(idx)}
                                            className={cn(
                                                'h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2',
                                                currentImage === idx ? 'border-primary' : 'border-transparent'
                                            )}
                                        >
                                            <img src={img} alt="" className="h-full w-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex aspect-video items-center justify-center rounded-xl bg-muted text-6xl">
                            🛠️
                        </div>
                    )}

                    {/* Ratings Section */}
                    <div className="space-y-4 pt-4">
                        <h2 className="text-xl font-bold">Calificaciones y Reseñas</h2>

                        {/* Summary */}
                        {ratingSummary && ratingSummary.totalRatings > 0 && (
                            <RatingSummary {...ratingSummary} />
                        )}

                        {/* Rating Form */}
                        {!isOwner && canRate && !showRatingForm && (
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setShowRatingForm(true)}
                            >
                                <Star className="mr-2 h-4 w-4" />
                                Escribir una reseña
                            </Button>
                        )}

                        {showRatingForm && (
                            <RatingForm
                                targetId={id!}
                                targetType="service"
                                targetName={service.businessName}
                                onSubmit={handleRatingSubmit}
                                onCancel={() => setShowRatingForm(false)}
                                loading={ratingsLoading}
                            />
                        )}

                        {/* Rating List */}
                        <RatingList ratings={ratings} loading={ratingsLoading} />
                    </div>
                </div>

                {/* Info */}
                <div className="space-y-6">
                    {/* Header */}
                    <div>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">{service.businessName}</h1>
                                <p className="text-muted-foreground">
                                    {categoryLabels[service.category as string] || service.category}
                                </p>
                            </div>

                            {isVerified ? (
                                <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                                    <CheckCircle className="h-4 w-4" />
                                    Verificado
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
                                    <Clock className="h-4 w-4" />
                                    Pendiente
                                </span>
                            )}
                        </div>

                        {/* Rating */}
                        <div className="mt-3 flex items-center gap-3">
                            <StarRating rating={service.stats?.averageRating || 0} showValue />
                            <span className="text-sm text-muted-foreground">
                                ({service.stats?.ratingsCount || 0} reseñas)
                            </span>
                            {(service.stats?.recommendations || 0) > 0 && (
                                <span className="text-sm font-medium text-green-600">
                                    {service.stats?.recommendations} recomendaciones
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="mb-2 font-semibold">Descripción</h3>
                            <p className="whitespace-pre-wrap text-muted-foreground">
                                {service.description}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Contact */}
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="mb-4 font-semibold">Contacto</h3>
                            <div className="space-y-3">
                                {service.contact.whatsapp && (
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-green-600"
                                        onClick={handleWhatsApp}
                                    >
                                        <MessageCircle className="mr-3 h-5 w-5" />
                                        WhatsApp: {service.contact.whatsapp}
                                    </Button>
                                )}
                                {service.contact.phone && (
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={handleCall}
                                    >
                                        <Phone className="mr-3 h-5 w-5" />
                                        {service.contact.phone}
                                    </Button>
                                )}
                                {service.contact.email && (
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={handleEmail}
                                    >
                                        <Mail className="mr-3 h-5 w-5" />
                                        {service.contact.email}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Owner Actions */}
                    {isOwner && (
                        <Link to={`/services/edit/${service.id}`}>
                            <Button variant="outline" className="w-full">
                                <Edit className="mr-2 h-4 w-4" />
                                Editar mi servicio
                            </Button>
                        </Link>
                    )}

                    {/* Contact CTA */}
                    {!isOwner && service.contact.whatsapp && (
                        <Button className="w-full" size="lg" onClick={handleWhatsApp}>
                            <MessageCircle className="mr-2 h-5 w-5" />
                            Contactar por WhatsApp
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
