import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/shared/image-upload';
import { useArticles } from '@/hooks/useArticles';
import { useCategories } from '@/hooks/useCategories';
import { useImageUpload } from '@/hooks/useImageUpload';
import { ArticleCondition } from '@/types';
import toast from 'react-hot-toast';

const conditions: { value: ArticleCondition; label: string; description: string }[] = [
    { value: 'new', label: 'Nuevo', description: 'Sin usar, con etiqueta' },
    { value: 'like_new', label: 'Como nuevo', description: 'Usado 1-2 veces' },
    { value: 'good', label: 'Buen estado', description: 'Uso normal, sin defectos' },
    { value: 'fair', label: 'Aceptable', description: 'Signos de uso visibles' },
];

interface FormData {
    title: string;
    description: string;
    category: string;
    subcategory: string;
    price: string;
    priceNegotiable: boolean;
    condition: ArticleCondition;
    grade: string;
    size: string;
    brand: string;
    images: string[];
}

const initialFormData: FormData = {
    title: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    priceNegotiable: false,
    condition: 'good',
    grade: '',
    size: '',
    brand: '',
    images: [],
};

export function ArticleFormPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = Boolean(id);

    const { createArticle, updateArticle, getArticle, loading: articlesLoading } = useArticles();
    const { categories, loading: categoriesLoading } = useCategories('article');
    const { uploadMultipleImages, uploading, compressImage } = useImageUpload();

    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [submitting, setSubmitting] = useState(false);
    const [loadingArticle, setLoadingArticle] = useState(isEditing);

    // Load article data if editing
    useEffect(() => {
        if (id) {
            loadArticle(id);
        }
    }, [id]);

    const loadArticle = async (articleId: string) => {
        try {
            setLoadingArticle(true);
            const article = await getArticle(articleId);

            if (article) {
                setFormData({
                    title: article.title,
                    description: article.description,
                    category: article.category,
                    subcategory: article.subcategory || '',
                    price: article.price.toString(),
                    priceNegotiable: article.priceNegotiable,
                    condition: article.condition,
                    grade: article.metadata?.grade || '',
                    size: article.metadata?.size || '',
                    brand: article.metadata?.brand || '',
                    images: article.images,
                });
            } else {
                toast.error('Artículo no encontrado');
                navigate('/marketplace');
            }
        } catch (error) {
            toast.error('Error al cargar el artículo');
            navigate('/marketplace');
        } finally {
            setLoadingArticle(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: (e.target as HTMLInputElement).checked,
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImagesChange = (images: string[]) => {
        setFormData(prev => ({ ...prev, images }));
    };

    const handleImageUpload = async (files: File[]): Promise<string[]> => {
        try {
            // Show feedback during compression
            const loadingToast = toast.loading('Preparando imágenes...');

            // Compress images before upload
            const compressedFiles = await Promise.all(
                files.map(file => compressImage(file, 1200, 0.8))
            );

            toast.dismiss(loadingToast);

            return uploadMultipleImages(compressedFiles, 'articles');
        } catch (error) {
            console.error('Error during image processing:', error);
            toast.error('Error al procesar las imágenes');
            return [];
        }
    };

    const validateForm = (): boolean => {
        if (!formData.title.trim()) {
            toast.error('El título es requerido');
            return false;
        }
        if (formData.title.length < 5) {
            toast.error('El título debe tener al menos 5 caracteres');
            return false;
        }
        if (!formData.description.trim()) {
            toast.error('La descripción es requerida');
            return false;
        }
        if (formData.description.length < 20) {
            toast.error('La descripción debe tener al menos 20 caracteres');
            return false;
        }
        if (!formData.category) {
            toast.error('Selecciona una categoría');
            return false;
        }
        if (!formData.price || Number(formData.price) <= 0) {
            toast.error('Ingresa un precio válido');
            return false;
        }
        if (formData.images.length < 1) {
            toast.error('Debes subir al menos 1 imagen');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSubmitting(true);

        try {
            const articleData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                category: formData.category as any,
                subcategory: formData.subcategory || null,
                price: Number(formData.price),
                priceNegotiable: formData.priceNegotiable,
                condition: formData.condition,
                metadata: {
                    grade: formData.grade || null,
                    size: formData.size || null,
                    brand: formData.brand || null,
                },
                images: formData.images,
            };

            if (isEditing && id) {
                await updateArticle(id, articleData);
                toast.success('Artículo actualizado');
            } else {
                await createArticle(articleData);
                // Success toast is now handled in createArticle or here? 
                // In my previous edit of useArticles, I commented out the toast there to avoid duplicates.
                // So keeping it here is correct.
                toast.success('Artículo publicado');
            }

            navigate('/marketplace/my-listings');
        } catch (error) {
            toast.error(isEditing ? 'Error al actualizar' : 'Error al publicar');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingArticle) {
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
                    {isEditing ? 'Editar artículo' : 'Publicar artículo'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Images */}
                <Card>
                    <CardHeader>
                        <CardTitle>Imágenes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ImageUpload
                            images={formData.images}
                            onImagesChange={handleImagesChange}
                            onUpload={handleImageUpload}
                            maxImages={5}
                            minImages={1}
                            uploading={uploading}
                            disabled={submitting}
                        />
                    </CardContent>
                </Card>

                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información básica</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">
                                Título *
                            </label>
                            <Input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Ej: Uniforme escolar talla 10"
                                maxLength={100}
                                disabled={submitting}
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                {formData.title.length}/100 caracteres
                            </p>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium">
                                Descripción *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe el artículo, su estado, medidas, etc."
                                rows={4}
                                maxLength={1000}
                                disabled={submitting}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                {formData.description.length}/1000 caracteres
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
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
                                    Estado *
                                </label>
                                <select
                                    name="condition"
                                    value={formData.condition}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {conditions.map((cond) => (
                                        <option key={cond.value} value={cond.value}>
                                            {cond.label} - {cond.description}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Price */}
                <Card>
                    <CardHeader>
                        <CardTitle>Precio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">
                                Precio (CLP) *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    $
                                </span>
                                <Input
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="0"
                                    min="0"
                                    step="100"
                                    disabled={submitting}
                                    className="pl-7"
                                />
                            </div>
                        </div>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="priceNegotiable"
                                checked={formData.priceNegotiable}
                                onChange={handleChange}
                                disabled={submitting}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <span className="text-sm">Precio negociable</span>
                        </label>
                    </CardContent>
                </Card>

                {/* Additional Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detalles adicionales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium">
                                    Curso/Grado
                                </label>
                                <Input
                                    name="grade"
                                    value={formData.grade}
                                    onChange={handleChange}
                                    placeholder="Ej: 5° Básico"
                                    disabled={submitting}
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium">
                                    Talla
                                </label>
                                <Input
                                    name="size"
                                    value={formData.size}
                                    onChange={handleChange}
                                    placeholder="Ej: 10 / M / 38"
                                    disabled={submitting}
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium">
                                    Marca
                                </label>
                                <Input
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    placeholder="Ej: Colloky"
                                    disabled={submitting}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

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
                                {isEditing ? 'Guardando...' : 'Publicando...'}
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                {isEditing ? 'Guardar cambios' : 'Publicar artículo'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
