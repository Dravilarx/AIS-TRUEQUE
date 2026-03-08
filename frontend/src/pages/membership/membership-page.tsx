import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, ShieldCheck, LogIn, ArrowRight, Store, UserIcon, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

export const MembershipPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [loadingTier, setLoadingTier] = useState<string | null>(null);
    const navigate = useNavigate();

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-6 bg-card p-10 rounded-3xl border shadow-xl">
                    <div className="flex justify-center">
                        <div className="bg-destructive/10 p-4 rounded-2xl">
                            <LogIn className="w-12 h-12 text-destructive" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold">Sesión requerida</h1>
                    <p className="text-muted-foreground">Debes iniciar sesión para elegir un plan.</p>
                    <Button onClick={() => navigate('/login')} className="w-full py-6">
                        Ir al Inicio de Sesión
                    </Button>
                </div>
            </div>
        );
    }

    const handleSelectTier = async (tier: 'free' | 'verified' | 'business') => {
        try {
            setLoadingTier(tier);

            // Calculamos 1 año futuro para que el estado general de membresía también pase el validador estricto actual
            const oneYearFromNow = Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));

            await updateDoc(doc(db, 'users', user.id), {
                accountTier: tier,
                'membership.status': 'active',
                'membership.expiresAt': oneYearFromNow,
            });

            toast.success(`¡Plan actualizado a ${tier.toUpperCase()} exitosamente!`);

            // Recargamos para forzar la sincronización del context de forma dura en local test
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);

        } catch (error) {
            console.error('Error al actualizar tier:', error);
            toast.error('Error al configurar tu plan.');
        } finally {
            setLoadingTier(null);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20 pt-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                        Elige tu plan en Dato Jardines
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Impulsa la economía circular en tu vecindario. Publica tus artículos usados, ofrece tus servicios profesionales o crea tu vitrina de negocio local.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

                    {/* Plan Free */}
                    <div className="bg-card rounded-3xl border shadow-sm p-8 flex flex-col h-full relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-muted p-2 rounded-lg">
                                <UserIcon className="w-6 h-6 text-foreground" />
                            </div>
                            <h2 className="text-xl font-bold">Vecino Casual</h2>
                        </div>
                        <div className="mb-6">
                            <span className="text-4xl font-black">Gratis</span>
                            <span className="text-muted-foreground">/siempre</span>
                        </div>
                        <p className="text-muted-foreground mb-6">
                            Para quienes solo quieren vitrinear o vender un par de cosas en la zona.
                        </p>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-muted-foreground shrink-0" />
                                <span>Límite de <strong>2 publicaciones</strong> activas</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-muted-foreground shrink-0" />
                                <span>Sin insignia de identidad validada</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-muted-foreground shrink-0" />
                                <span>Acceso al mercado comunitario global</span>
                            </li>
                        </ul>

                        <Button
                            variant="outline"
                            className="w-full py-6 text-lg rounded-xl"
                            onClick={() => handleSelectTier('free')}
                            disabled={loadingTier !== null}
                        >
                            {loadingTier === 'free' ? 'Configurando...' : 'Usar versión Gratis'}
                        </Button>
                    </div>

                    {/* Plan Verified */}
                    <div className="bg-card rounded-3xl border-2 border-primary shadow-xl p-8 flex flex-col h-full relative transform md:-translate-y-4">
                        <div className="absolute top-0 right-0 p-4">
                            <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full tracking-wider">
                                POPULAR
                            </span>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-primary/20 p-2 rounded-lg">
                                <ShieldCheck className="w-6 h-6 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold">Vecino Validado</h2>
                        </div>
                        <div className="mb-6">
                            <span className="text-4xl font-black">$12.000</span>
                            <span className="text-muted-foreground">/año</span>
                        </div>
                        <p className="text-muted-foreground mb-6">
                            La opción segura para padres y apoderados. Transacciones confiables.
                        </p>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                                <span>Insignia de <strong>Identidad Verificada</strong> (KYC)</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                                <span><strong>Publicaciones ilimitadas</strong> de artículos</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                                <span>Acceso exclusivo a <strong>Clústeres de Colegios</strong></span>
                            </li>
                        </ul>

                        <Button
                            className="w-full py-6 text-lg rounded-xl font-bold bg-primary hover:bg-primary/90"
                            onClick={() => handleSelectTier('verified')}
                            disabled={loadingTier !== null}
                        >
                            {loadingTier === 'verified' ? 'Configurando...' : 'Adquirir Plan Valorado'}
                        </Button>
                    </div>

                    {/* Plan Business */}
                    <div className="bg-gradient-to-b from-blue-900 to-slate-900 text-white rounded-3xl border border-blue-800 shadow-2xl p-8 flex flex-col h-full relative">
                        <div className="absolute top-0 right-0 p-4">
                            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                                IMPULSA TU NEGOCIO
                            </span>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-800/50 p-2 rounded-lg border border-blue-500/30">
                                <Store className="w-6 h-6 text-blue-300" />
                            </div>
                            <h2 className="text-xl font-bold text-blue-50">Perfil Negocio B2C</h2>
                        </div>
                        <div className="mb-6">
                            <span className="text-4xl font-black">$9.990</span>
                            <span className="text-blue-300">/mes</span>
                        </div>
                        <p className="text-blue-200 mb-6">
                            Conecta tu emprendimiento o servicios profesionales con miles de vecinos.
                        </p>

                        <ul className="space-y-4 mb-8 flex-1 text-blue-100">
                            <li className="flex gap-3">
                                <Check className="w-5 h-5 text-blue-400 shrink-0 font-bold" />
                                <span>Todo lo de validado, más:</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-400 shrink-0" />
                                <span>Sección comercial y <strong>Catálogo Propio</strong></span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-400 shrink-0" />
                                <span><strong>Visibilidad prioritaria</strong> en búsquedas</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-400 shrink-0" />
                                <span>Métricas de rendimiento e impacto</span>
                            </li>
                        </ul>

                        <Button
                            className="w-full py-6 text-lg rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.02]"
                            onClick={() => handleSelectTier('business')}
                            disabled={loadingTier !== null}
                        >
                            {loadingTier === 'business' ? 'Configurando...' : 'Crear mi Negocio B2C'}
                        </Button>
                    </div>

                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm text-muted-foreground">
                        Nota de desarrollo: Al seleccionar un plan, el nivel de administrador en Firestore se auto-actualizará. No hay cargos reales involucrados en la simulación B2C.
                    </p>
                </div>
            </div>
        </div>
    );
};
