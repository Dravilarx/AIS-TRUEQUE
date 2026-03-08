import { Link } from 'react-router-dom';
import { School, Building, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const schoolsList = [
    {
        id: 'ais',
        name: 'Antofagasta International School',
        shortName: 'AIS',
        description: 'La comunidad original de Trueque. Intercambio de uniformes, libros y útiles para familias del AIS.',
        color: 'bg-blue-600',
        available: true,
        location: 'Jardines del Sur'
    },
    {
        id: 'antonio-rendic',
        name: 'Colegio Antonio Rendic',
        shortName: 'Rendic',
        description: 'Encuentra artículos escolares, uniformes y material específico para el colegio Antonio Rendic.',
        color: 'bg-red-600',
        available: true,
        location: 'Antofagasta'
    },
    {
        id: 'british-school',
        name: 'The British School',
        shortName: 'British',
        description: 'Sección exclusiva para la comunidad del British School. Uniformes, textos y más.',
        color: 'bg-green-600',
        available: true,
        location: 'Antofagasta'
    },
    {
        id: 'otros',
        name: 'Más colegios',
        shortName: 'Pronto',
        description: 'Próximamente estaremos abriendo secciones para más colegios de la zona.',
        color: 'bg-slate-400',
        available: false,
        location: 'Antofagasta'
    }
];

export function SchoolsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <School className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Comunidades Escolares</h1>
                        <p className="text-muted-foreground mt-1">
                            Selecciona tu colegio para ver artículos específicos de tu comunidad.
                        </p>
                    </div>
                </div>
            </div>

            {/* Schools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schoolsList.map((school) => (
                    <Card
                        key={school.id}
                        className={`flex flex-col overflow-hidden transition-all duration-300 ${school.available ? 'hover:shadow-md hover:border-primary/50 cursor-pointer' : 'opacity-70'}`}
                    >
                        <div className={`h-2 w-full ${school.color}`} />
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldCheck className={`h-4 w-4 text-muted-foreground`} />
                                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Colegio Verificado</span>
                                    </div>
                                    <CardTitle className="text-xl">{school.name}</CardTitle>
                                    <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                                        <MapPin className="h-3 w-3" /> {school.location}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-foreground/80 leading-relaxed">
                                {school.description}
                            </p>
                        </CardContent>
                        <CardFooter className="pt-4 border-t bg-muted/20">
                            {school.available ? (
                                <Link to={`/marketplace?school=${school.id}`} className="w-full">
                                    <Button className="w-full" variant="default">
                                        Entrar a la comunidad
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            ) : (
                                <Button className="w-full" variant="secondary" disabled>
                                    Próximamente
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Dato Jardines Call to Action */}
            <div className="mt-12 rounded-2xl bg-primary/5 p-8 text-center border overflow-hidden relative">
                <div className="absolute -right-16 -top-16 opacity-5">
                    <Building className="h-64 w-64" />
                </div>
                <h3 className="text-2xl font-bold mb-3 relative z-10">¿Buscas artículos generales?</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-6 relative z-10">
                    Dato Jardines es más que colegios. Descubre el Marketplace general abierto a toda nuestra comunidad, donde podrás comprar y vender de todo.
                </p>
                <Link to="/marketplace" className="relative z-10">
                    <Button size="lg" variant="outline" className="bg-background">
                        Ir al Marketplace General
                    </Button>
                </Link>
            </div>
        </div>
    );
}
