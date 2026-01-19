import { useState, useCallback, useRef, DragEvent, ChangeEvent } from 'react';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    onUpload: (files: File[]) => Promise<string[]>;
    maxImages?: number;
    minImages?: number;
    uploading?: boolean;
    disabled?: boolean;
}

export function ImageUpload({
    images,
    onImagesChange,
    onUpload,
    maxImages = 5,
    minImages = 3,
    uploading = false,
    disabled = false,
}: ImageUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(async (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (disabled || uploading) return;

        const files = Array.from(e.dataTransfer.files).filter(f =>
            f.type.startsWith('image/')
        );

        if (files.length === 0) return;

        const remaining = maxImages - images.length;
        const filesToUpload = files.slice(0, remaining);

        if (filesToUpload.length > 0) {
            const newUrls = await onUpload(filesToUpload);
            onImagesChange([...images, ...newUrls]);
        }
    }, [disabled, uploading, images, maxImages, onUpload, onImagesChange]);

    const handleFileSelect = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        if (disabled || uploading || !e.target.files) return;

        const files = Array.from(e.target.files);
        const remaining = maxImages - images.length;
        const filesToUpload = files.slice(0, remaining);

        if (filesToUpload.length > 0) {
            const newUrls = await onUpload(filesToUpload);
            onImagesChange([...images, ...newUrls]);
        }

        // Reset input
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }, [disabled, uploading, images, maxImages, onUpload, onImagesChange]);

    const removeImage = useCallback((index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
    }, [images, onImagesChange]);

    const moveImage = useCallback((fromIndex: number, toIndex: number) => {
        const newImages = [...images];
        const [removed] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, removed);
        onImagesChange(newImages);
    }, [images, onImagesChange]);

    const canAddMore = images.length < maxImages;
    const needsMore = images.length < minImages;

    return (
        <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between text-sm">
                <span className={cn(
                    needsMore ? 'text-destructive' : 'text-muted-foreground'
                )}>
                    {images.length} de {maxImages} imágenes
                    {needsMore && ` (mínimo ${minImages})`}
                </span>
                {images.length > 0 && (
                    <span className="text-muted-foreground">
                        Arrastra para reordenar
                    </span>
                )}
            </div>

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                    {images.map((url, index) => (
                        <div
                            key={url}
                            className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', index.toString());
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                                if (fromIndex !== index) {
                                    moveImage(fromIndex, index);
                                }
                            }}
                        >
                            <img
                                src={url}
                                alt={`Imagen ${index + 1}`}
                                className="h-full w-full object-cover"
                            />

                            {/* Badge for main image */}
                            {index === 0 && (
                                <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
                                    Principal
                                </span>
                            )}

                            {/* Remove button */}
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                disabled={disabled}
                                className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Zone */}
            {canAddMore && (
                <div
                    className={cn(
                        'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
                        dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
                        disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        disabled={disabled || uploading}
                        className="absolute inset-0 cursor-pointer opacity-0"
                    />

                    {uploading ? (
                        <>
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="mt-2 text-sm text-muted-foreground">Subiendo imágenes...</p>
                        </>
                    ) : (
                        <>
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                {dragActive ? (
                                    <Upload className="h-6 w-6 text-primary" />
                                ) : (
                                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                )}
                            </div>
                            <p className="mt-3 text-sm font-medium">
                                {dragActive ? 'Suelta las imágenes aquí' : 'Arrastra imágenes o haz clic para seleccionar'}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                PNG, JPG hasta 5MB cada una
                            </p>
                        </>
                    )}
                </div>
            )}

            {/* Quick add button when has some images */}
            {images.length > 0 && canAddMore && !uploading && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    disabled={disabled}
                >
                    <Upload className="mr-2 h-4 w-4" />
                    Agregar más imágenes
                </Button>
            )}
        </div>
    );
}
