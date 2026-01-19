import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    User, Mail, Phone, Calendar, Star, Package, Briefcase,
    LogOut, Edit, Shield, CreditCard, Bell, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from '@/components/shared/star-rating';
import { useAuth } from '@/hooks/useAuth';
import { useArticles } from '@/hooks/useArticles';
import { useServices } from '@/hooks/useServices';
import { formatRelativeTime, cn } from '@/lib/utils';

export function ProfilePage() {
    const navigate = useNavigate();
    const { user, userData, signOut, loading: authLoading } = useAuth();
    const { myArticles, fetchMyArticles } = useArticles();
    const { myService, fetchMyService } = useServices();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchMyArticles(), fetchMyService()]);
        setLoading(false);
    };

    const handleSignOut = async () => {
        if (confirm('¿Estás seguro de cerrar sesión?')) {
            await signOut();
            navigate('/login');
        }
    };

    if (authLoading || !user) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const membershipStatus = userData?.membership?.status || 'pending';
    const membershipPlan = userData?.membership?.plan || 'monthly';
    const membershipExpires = userData?.membership?.expiresAt;

    const planLabels: Record<string, string> = {
        monthly: 'Mensual',
        quarterly: 'Trimestral',
        annual: 'Anual',
    };

    const statusLabels: Record<string, { label: string; color: string }> = {
        active: { label: 'Activa', color: 'bg-green-100 text-green-800' },
        expired: { label: 'Expirada', color: 'bg-red-100 text-red-800' },
        pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    };

    const activeArticles = myArticles.filter(a => a.status === 'active').length;
    const soldArticles = myArticles.filter(a => a.status === 'sold').length;

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            {/* Profile Header */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
                        {/* Avatar */}
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-3xl font-bold text-white">
                            {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                        </div>

                        <div className="mt-4 flex-1 sm:ml-6 sm:mt-0">
                            <h1 className="text-2xl font-bold">{user.displayName || 'Usuario'}</h1>
                            <p className="text-muted-foreground">{user.email}</p>

                            {/* Stats */}
                            {userData?.stats && (
                                <div className="mt-2 flex items-center justify-center gap-3 sm:justify-start">
                                    <StarRating rating={userData.stats.averageRating || 0} size="sm" />
                                    <span className="text-sm text-muted-foreground">
                                        ({userData.stats.ratingsCount || 0} reseñas)
                                    </span>
                                </div>
                            )}
                        </div>

                        <Button variant="outline" size="icon" className="hidden sm:flex">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Membership Card */}
            <Card className="overflow-hidden">
                <div className={cn(
                    'p-4',
                    membershipStatus === 'active' && 'bg-gradient-to-r from-primary to-primary/80 text-white'
                )}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CreditCard className="h-6 w-6" />
                            <div>
                                <h3 className="font-semibold">Membresía {planLabels[membershipPlan]}</h3>
                                <p className={cn(
                                    'text-sm',
                                    membershipStatus === 'active' ? 'text-white/80' : 'text-muted-foreground'
                                )}>
                                    {membershipExpires
                                        ? `Vence ${formatRelativeTime(membershipExpires)}`
                                        : 'Sin fecha de expiración'
                                    }
                                </p>
                            </div>
                        </div>
                        <span className={cn(
                            'rounded-full px-3 py-1 text-sm font-medium',
                            membershipStatus === 'active'
                                ? 'bg-white/20 text-white'
                                : statusLabels[membershipStatus].color
                        )}>
                            {statusLabels[membershipStatus].label}
                        </span>
                    </div>
                </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <Package className="mx-auto h-6 w-6 text-primary" />
                        <p className="mt-2 text-2xl font-bold">{myArticles.length}</p>
                        <p className="text-xs text-muted-foreground">Publicaciones</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="mx-auto h-6 w-6 text-green-500">✓</div>
                        <p className="mt-2 text-2xl font-bold">{activeArticles}</p>
                        <p className="text-xs text-muted-foreground">Activas</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="mx-auto h-6 w-6 text-blue-500">💰</div>
                        <p className="mt-2 text-2xl font-bold">{soldArticles}</p>
                        <p className="text-xs text-muted-foreground">Vendidas</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Briefcase className="mx-auto h-6 w-6 text-purple-500" />
                        <p className="mt-2 text-2xl font-bold">{myService ? 1 : 0}</p>
                        <p className="text-xs text-muted-foreground">Servicios</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Links */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Accesos rápidos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Link to="/marketplace/my-listings">
                        <Button variant="ghost" className="w-full justify-start">
                            <Package className="mr-3 h-5 w-5" />
                            Mis publicaciones
                        </Button>
                    </Link>
                    <Link to={myService ? `/services/edit/${myService.id}` : '/services/register'}>
                        <Button variant="ghost" className="w-full justify-start">
                            <Briefcase className="mr-3 h-5 w-5" />
                            {myService ? 'Mi servicio' : 'Ofrecer un servicio'}
                        </Button>
                    </Link>
                    <Button variant="ghost" className="w-full justify-start" disabled>
                        <Bell className="mr-3 h-5 w-5" />
                        Notificaciones
                        <span className="ml-auto text-xs text-muted-foreground">Próximamente</span>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" disabled>
                        <Shield className="mr-3 h-5 w-5" />
                        Privacidad y seguridad
                        <span className="ml-auto text-xs text-muted-foreground">Próximamente</span>
                    </Button>
                </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Información de la cuenta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                    {userData?.phone && (
                        <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Teléfono</p>
                                <p className="text-sm text-muted-foreground">{userData.phone}</p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Miembro desde</p>
                            <p className="text-sm text-muted-foreground">
                                {userData?.createdAt
                                    ? formatRelativeTime(userData.createdAt)
                                    : 'Fecha no disponible'
                                }
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sign Out */}
            <Button
                variant="outline"
                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleSignOut}
            >
                <LogOut className="mr-2 h-5 w-5" />
                Cerrar sesión
            </Button>
        </div>
    );
}
