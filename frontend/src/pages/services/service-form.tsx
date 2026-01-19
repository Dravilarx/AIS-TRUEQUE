import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/shared/image-upload';
import { useServices } from '@/hooks/useServices';
import { useCategories } from '@/hooks/useCategories';
import { useImageUpload } from '@/hooks/useImageUpload';
import toast from 'react-hot-toast';

interface FormData {
    businessName: string;
    description: string;
    category: string;
    phone: string;
    email: string;
    whatsapp: string;
    images: string[];
}

const initialFormData: FormData = {
    businessName: '',
    description: '',
    category: '',
    phone: '',
    email: '',
    whatsapp: '',
    images: [],
};

export function ServiceFormPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = Boolean(id);

    const { myService, getService, createService, updateService, fetchMyService, loading: serviceLoading } = useServices();
    const { categories, loading: categoriesLoading } = useCategories('service');
    const { uploadMultipleImages, uploading, compressImage } = useImageUpload();

    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [submitting, setSubmitting] = useState(false);
    const [loadingData, setLoadingData] = useState(isEditing);

    useEffect(() => {
        if (isEditing && id) {
            loadService(id);
        } else {
            // Check if user already has a service
            fetchMyService();
        }
    }, [id, isEditing]);

    useEffect(() => {
        if (!isEditing && myService) {
            // User already has a service, redirect to edit
            navigate(`/services/edit/${myService.id}`, { replace: true });
        }
    }, [myService, isEditing, navigate]);

    const loadService = async (serviceId: string) => {
        try {
            setLoadingData(true);
            const service = await getService(serviceId);

            if (service) {
                setFormData({
                    businessName: service.businessName,
                    description: service.description,
                    category: service.category as string,
                    phone: service.contact?.phone || '',
                    email: service.contact?.email || '',
                    whatsapp: service.contact?.whatsapp || '',
                    images: service.images || [],
                });
            } else {
                toast.error('Servicio no encontrado');
                navigate('/services');
            }
        } catch (error) {
            toast.error('Error al cargar servicio');
            navigate('/services');
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImagesChange = (images: string[]) => {
        setFormData((prev) => ({ ...prev, images }));
    };

    const handleImageUpload = async (files: File[]): Promise<string[]> => {
        const compressedFiles = await Promise.all(
            files.map((file) => compressImage(file, 1200, 0.8))
        );
        return uploadMultipleImages(compressedFiles, 'services');
    };

    const validateForm = (): boolean => {
        if (!formData.businessName.trim()) {
            toast.error('El nombre del negocio es requerido');
            return false;
        }
        if (!formData.description.trim()) {
            toast.error('La descripción es requerida');
            return false;
        }
        if (formData.description.length < 30) {
            toast.error('La descripción debe tener al menos 30 caracteres');
            return false;
        }
        if (!formData.category) {
            toast.error('Selecciona una categoría');
            return false;
        }
        if (!formData.phone && !formData.email && !formData.whatsapp) {
            toast.error('Ingresa al menos un método de contacto');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSubmitting(true);

        try {
            const serviceData = {
                businessName: formData.businessName.trim(),
                description: formData.description.trim(),
                category: formData.category,
                contact: {
                    phone: formData.phone || undefined,
                    email: formData.email || undefined,
                    whatsapp: formData.whatsapp || undefined,
                },
                images: formData.images,
            };

            if (isEditing && id) {
                await updateService(id, serviceData);
                toast.success('Servicio actualizado');
            } else {
                await createService(serviceData);
                toast.success('¡Servicio registrado!');
            }

            navigate('/services');
        } catch (error) {
            toast.error(isEditing ? 'Error al actualizar' : 'Error al registrar');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold">
                    {isEditing ? 'Editar servicio' : 'Ofrecer un servicio'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Images */}
                <Card>
                    <CardHeader>
                        <CardTitle>Imágenes (opcional)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ImageUpload
                            images={formData.images}
                            onImagesChange={handleImagesChange}
                            onUpload={handleImageUpload}
                            maxImages={5}
                            minImages={0}
                            uploading={uploading}
                            disabled={submitting}
                        />
                    </CardContent>
                </Card>

                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información del servicio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">
                                Nombre del negocio/servicio *
                            </label>
                            <Input
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleChange}
                                placeholder="Ej: Clases de Inglés - María González"
                                maxLength={100}
                                disabled={submitting}
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium">
                                Categoría *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                disabled={submitting || categoriesLoading}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Selecciona...</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.slug}>
                                        {cat.icon} {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium">
                                Descripción *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe tu servicio, experiencia, horarios, precios, etc."
                                rows={5}
                                maxLength={1500}
                                disabled={submitting}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                {formData.description.length}/1500 caracteres
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact */}
                <Card>
                    <CardHeader>
                        <CardTitle>Datos de contacto</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Ingresa al menos un método de contacto
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">
                                WhatsApp (recomendado)
                            </label>
                            <Input
                                name="whatsapp"
                                value={formData.whatsapp}
                                onChange={handleChange}
                                placeholder="+56 9 1234 5678"
                                disabled={submitting}
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium">
                                Teléfono
                            </label>
                            <Input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+56 9 1234 5678"
                                disabled={submitting}
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium">
                                Email
                            </label>
                            <Input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="tu@email.com"
                                disabled={submitting}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Notice */}
                {!isEditing && (
                    <Card className="border-primary/50 bg-primary/5">
                        <CardContent className="p-4 text-sm">
                            <p className="font-medium text-primary">📋 Proceso de verificación</p>
                            <p className="mt-1 text-muted-foreground">
                                Tu servicio será revisado por nuestro equipo antes de publicarse.
                                Recibirás una notificación cuando sea aprobado.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Submit */}
                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(-1)}
                        disabled={submitting}
                        className="flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={submitting || uploading}
                        className="flex-1"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isEditing ? 'Guardando...' : 'Registrando...'}
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                {isEditing ? 'Guardar cambios' : 'Registrar servicio'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
