import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const PaymentStatusPage = ({ status }: { status: 'success' | 'failure' | 'pending' }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { userData } = useAuth();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (status === 'success') {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        navigate('/');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [status, navigate]);

    const paymentId = searchParams.get('payment_id');

    const config = {
        success: {
            icon: <CheckCircle className="w-20 h-20 text-green-500" />,
            title: '¡Pago Exitoso!',
            description: 'Tu membresía ha sido activada correctamente. Ya puedes disfrutar de todos los beneficios de AIS Trueque.',
            buttonText: 'Ir al Inicio',
            buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
        },
        failure: {
            icon: <XCircle className="w-20 h-20 text-destructive" />,
            title: 'Pago Fallido',
            description: 'No pudimos procesar tu pago. Por favor, intenta nuevamente o utiliza otro método de pago.',
            buttonText: 'Reintentar Pago',
            buttonClass: 'bg-destructive hover:bg-destructive/90 text-white',
        },
        pending: {
            icon: <Clock className="w-20 h-20 text-yellow-500" />,
            title: 'Pago Pendiente',
            description: 'Tu pago está siendo procesado por Mercado Pago. Te notificaremos cuando se complete la transacción.',
            buttonText: 'Ir a mi Perfil',
            buttonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        }
    };

    const current = config[status];

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-6 bg-card p-10 rounded-3xl border shadow-xl">
                <div className="flex justify-center animate-in zoom-in duration-500">
                    {current.icon}
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">{current.title}</h1>
                    <p className="text-muted-foreground">
                        {current.description}
                    </p>
                </div>

                {paymentId && (
                    <div className="text-xs text-muted-foreground bg-muted p-2 rounded-lg">
                        ID de Operación: {paymentId}
                    </div>
                )}

                <div className="pt-4 space-y-4">
                    <button
                        onClick={() => navigate(status === 'failure' ? '/membership' : '/')}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${current.buttonClass}`}
                    >
                        {current.buttonText}
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    {status === 'success' && (
                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Redirigiendo automáticamente en {countdown} segundos...
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
