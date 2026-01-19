import { Link } from 'react-router-dom';
import { Phone, Mail, MessageCircle, Star, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/shared/star-rating';
import { ServiceProvider } from '@/types';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
    service: ServiceProvider;
}

const categoryIcons: Record<string, string> = {
    tutoring: '📖',
    transport: '🚐',
    catering: '🍱',
    events: '🎉',
    repairs: '🔧',
    other: '🛠️',
};

const categoryLabels: Record<string, string> = {
    tutoring: 'Clases Particulares',
    transport: 'Transporte Escolar',
    catering: 'Colaciones/Almuerzos',
    events: 'Eventos/Cumpleaños',
    repairs: 'Reparaciones',
    other: 'Otros',
};

export function ServiceCard({ service }: ServiceCardProps) {
    const handleWhatsApp = () => {
        if (service.contact.whatsapp) {
            const phone = service.contact.whatsapp.replace(/\D/g, '');
            window.open(`https://wa.me/${phone}`, '_blank');
        }
    };

    const handleCall = () => {
        if (service.contact.phone) {
            window.location.href = `tel:${service.contact.phone}`;
        }
    };

    const handleEmail = () => {
        if (service.contact.email) {
            window.location.href = `mailto:${service.contact.email}`;
        }
    };

    const isVerified = service.verification?.status === 'verified';
    const isPending = service.verification?.status === 'pending';

    return (
        <Card className="overflow-hidden transition-shadow hover:shadow-lg">
            <CardContent className="p-0">
                {/* Image */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                    {service.images && service.images.length > 0 ? (
                        <img
                            src={service.images[0]}
                            alt={service.businessName}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-4xl">
                            {categoryIcons[service.category as string] || '🛠️'}
                        </div>
                    )}

                    {/* Category Badge */}
                    <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-medium shadow">
                        {categoryIcons[service.category as string]} {categoryLabels[service.category as string] || service.category}
                    </span>

                    {/* Verification Badge */}
                    {isVerified && (
                        <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white">
                            <CheckCircle className="h-3 w-3" />
                            Verificado
                        </span>
                    )}
                    {isPending && (
                        <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
                            <Clock className="h-3 w-3" />
                            Pendiente
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    <Link to={`/services/${service.id}`}>
                        <h3 className="font-semibold hover:text-primary">
                            {service.businessName}
                        </h3>
                    </Link>

                    {/* Rating */}
                    <div className="mt-1 flex items-center gap-2">
                        <StarRating rating={service.stats?.averageRating || 0} size="sm" />
                        <span className="text-sm text-muted-foreground">
                            ({service.stats?.ratingsCount || 0})
                        </span>
                        {(service.stats?.recommendations || 0) > 0 && (
                            <span className="text-sm text-green-600">
                                · {service.stats?.recommendations} recomendaciones
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {service.description}
                    </p>

                    {/* Contact Actions */}
                    <div className="mt-4 flex gap-2">
                        {service.contact.whatsapp && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-green-600 hover:text-green-700"
                                onClick={handleWhatsApp}
                            >
                                <MessageCircle className="mr-1 h-4 w-4" />
                                WhatsApp
                            </Button>
                        )}
                        {service.contact.phone && (
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0"
                                onClick={handleCall}
                            >
                                <Phone className="h-4 w-4" />
                            </Button>
                        )}
                        {service.contact.email && (
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0"
                                onClick={handleEmail}
                            >
                                <Mail className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
