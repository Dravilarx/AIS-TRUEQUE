import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CreditCard, CheckCircle, ShieldCheck, ArrowRight, Loader2, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export const MembershipPage = () => {
    const { user, firebaseUser, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="mt-4 text-muted-foreground font-medium animate-pulse">Cargando información segura...</p>
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
                    <p className="text-muted-foreground">Debes iniciar sesión para poder adquirir una membresía.</p>
                    <Button onClick={() => navigate('/login')} className="w-full py-6">
                        Ir al Inicio de Sesión
                    </Button>
                </div>
            </div>
        );
    }

    const handlePayment = async () => {
        if (!user || !firebaseUser) {
            toast.error('Debes iniciar sesión para realizar el pago');
            return;
        }

        try {
            setLoading(true);
            const token = await firebaseUser.getIdToken();

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/create-preference`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            const data = await response.json();

            if (data.init_point) {
                // Redirigir a Mercado Pago
                window.location.href = data.init_point;
            } else {
                throw new Error('No se pudo obtener el link de pago');
            }
        } catch (error) {
            console.error('Error al iniciar el pago:', error);
            toast.error('Error al conectar con Mercado Pago. Intenta más tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <div className="max-w-xl w-full text-center space-y-8 bg-card p-10 rounded-3xl border shadow-xl">
                <div className="flex justify-center">
                    <div className="bg-primary/10 p-4 rounded-2xl">
                        <ShieldCheck className="w-16 h-16 text-primary" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight">Activa tu Membresía</h1>
                    <p className="text-muted-foreground text-lg">
                        Únete a la comunidad de AIS Trueque y comienza a intercambiar uniformes y útiles escolares.
                    </p>
                </div>

                <div className="bg-muted/50 p-8 rounded-2xl border-2 border-primary/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3">
                        <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            Recomendado
                        </span>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-4">
                        <h2 className="text-2xl font-bold">Membresía Anual</h2>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black">$10.000</span>
                            <span className="text-muted-foreground">/año</span>
                        </div>

                        <ul className="text-left space-y-3 py-4">
                            <li className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 fill-green-500/10" />
                                <span>Publicaciones ilimitadas</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 fill-green-500/10" />
                                <span>Acceso a todos los servicios</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 fill-green-500/10" />
                                <span>Verificación de perfil escolar</span>
                            </li>
                        </ul>

                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${loading
                                ? 'bg-muted cursor-not-allowed text-muted-foreground'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Conectando...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="w-6 h-6" />
                                    Pagar con Mercado Pago
                                    <ArrowRight className="w-5 h-5 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground">
                    Pago seguro procesado por Mercado Pago. <br />
                    Tu membresía se activará automáticamente al confirmarse el pago.
                </p>
            </div>
        </div>
    );
};
