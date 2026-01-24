import { useState, useCallback } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

interface UploadProgress {
    fileName: string;
    progress: number;
    url?: string;
    error?: string;
}

export function useImageUpload() {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);

    const uploadImage = useCallback(async (file: File, folder = 'articles'): Promise<string | null> => {
        if (!user) {
            toast.error('Debes iniciar sesión para subir imágenes');
            return null;
        }

        // Validate file
        if (!file.type.startsWith('image/')) {
            toast.error('Solo se permiten archivos de imagen');
            return null;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error('La imagen no puede superar 5MB');
            return null;
        }

        try {
            // Create unique filename
            const timestamp = Date.now();
            const extension = file.name.split('.').pop();
            const fileName = `${folder}/${user.uid}/${timestamp}.${extension}`;

            const storageRef = ref(storage, fileName);

            // Upload file with timeout
            const uploadPromise = uploadBytes(storageRef, file);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Upload timeout')), 30000)
            );

            await Promise.race([uploadPromise, timeoutPromise]);

            // Get download URL
            const downloadUrl = await getDownloadURL(storageRef);

            return downloadUrl;
        } catch (error: any) {
            console.error('Error uploading image:', error);

            if (error.message === 'Upload timeout') {
                toast.error('La carga tomó demasiado tiempo. Verifica tu conexión.');
            } else if (error.code === 'storage/unauthorized') {
                toast.error('No tienes permisos para subir imágenes.');
            } else if (error.code === 'storage/canceled') {
                toast.error('La carga fue cancelada.');
            } else {
                toast.error('Error al subir la imagen. Intenta nuevamente.');
            }

            return null;
        }
    }, [user]);

    const uploadMultipleImages = useCallback(async (
        files: File[],
        folder = 'articles'
    ): Promise<string[]> => {
        if (!user) {
            toast.error('Debes iniciar sesión para subir imágenes');
            return [];
        }

        setUploading(true);
        setUploadProgress(files.map(f => ({ fileName: f.name, progress: 0 })));

        const urls: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            try {
                const url = await uploadImage(file, folder);

                if (url) {
                    urls.push(url);
                    setUploadProgress(prev =>
                        prev.map((p, idx) =>
                            idx === i ? { ...p, progress: 100, url } : p
                        )
                    );
                } else {
                    setUploadProgress(prev =>
                        prev.map((p, idx) =>
                            idx === i ? { ...p, error: 'Error al subir' } : p
                        )
                    );
                }
            } catch (error) {
                setUploadProgress(prev =>
                    prev.map((p, idx) =>
                        idx === i ? { ...p, error: 'Error al subir' } : p
                    )
                );
            }
        }

        setUploading(false);
        return urls;
    }, [user, uploadImage]);

    const deleteImage = useCallback(async (url: string): Promise<boolean> => {
        try {
            // Extract path from URL
            const decodedUrl = decodeURIComponent(url);
            const pathMatch = decodedUrl.match(/\/o\/(.+?)\?/);

            if (!pathMatch) {
                console.error('Could not extract path from URL');
                return false;
            }

            const path = pathMatch[1];
            const storageRef = ref(storage, path);

            await deleteObject(storageRef);
            return true;
        } catch (error) {
            console.error('Error deleting image:', error);
            return false;
        }
    }, []);

    const compressImage = useCallback(async (
        file: File,
        maxWidth = 1200,
        quality = 0.8
    ): Promise<File> => {
        return new Promise((resolve, reject) => {
            // Set timeout for compression (10 seconds)
            const timeout = setTimeout(() => {
                console.warn('Image compression timeout, using original file');
                resolve(file);
            }, 10000);

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            if (!ctx) {
                console.error('Could not get canvas context');
                clearTimeout(timeout);
                resolve(file);
                return;
            }

            img.onload = () => {
                try {
                    let { width, height } = img;

                    // Only compress if image is larger than maxWidth
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            clearTimeout(timeout);
                            URL.revokeObjectURL(img.src); // Clean up

                            if (blob) {
                                const compressedFile = new File([blob], file.name, {
                                    type: 'image/jpeg',
                                    lastModified: Date.now(),
                                });
                                console.log(`Compressed ${file.name}: ${(file.size / 1024).toFixed(1)}KB → ${(blob.size / 1024).toFixed(1)}KB`);
                                resolve(compressedFile);
                            } else {
                                console.warn('Blob creation failed, using original file');
                                resolve(file);
                            }
                        },
                        'image/jpeg',
                        quality
                    );
                } catch (error) {
                    console.error('Error during compression:', error);
                    clearTimeout(timeout);
                    URL.revokeObjectURL(img.src);
                    resolve(file);
                }
            };

            img.onerror = (error) => {
                console.error('Error loading image for compression:', error);
                clearTimeout(timeout);
                URL.revokeObjectURL(img.src);
                resolve(file); // Use original file on error
            };

            try {
                img.src = URL.createObjectURL(file);
            } catch (error) {
                console.error('Error creating object URL:', error);
                clearTimeout(timeout);
                resolve(file);
            }
        });
    }, []);

    return {
        uploading,
        uploadProgress,
        uploadImage,
        uploadMultipleImages,
        deleteImage,
        compressImage,
    };
}
