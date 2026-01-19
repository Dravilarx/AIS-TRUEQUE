import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import api from '@/lib/api';

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
    type: 'article' | 'service';
    order: number;
    isActive: boolean;
}

export function useCategories(type?: 'article' | 'service') {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Try API first (for cached/admin-managed categories)
            try {
                const response = await api.get('/categories', {
                    params: type ? { type } : undefined,
                });

                if (response.data.success) {
                    setCategories(response.data.data);
                    return;
                }
            } catch {
                // Fall back to direct Firestore query
                console.log('API unavailable, using Firestore directly');
            }

            // Direct Firestore fallback
            let q = query(
                collection(db, 'categories'),
                where('isActive', '==', true),
                orderBy('order', 'asc')
            );

            if (type) {
                q = query(q, where('type', '==', type));
            }

            const snapshot = await getDocs(q);
            const cats = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Category[];

            setCategories(cats);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Error al cargar categorías');

            // Use default categories as ultimate fallback
            setCategories(getDefaultCategories(type));
        } finally {
            setLoading(false);
        }
    }, [type]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return { categories, loading, error, refetch: fetchCategories };
}

// Default categories fallback
function getDefaultCategories(type?: 'article' | 'service'): Category[] {
    const articleCategories: Category[] = [
        { id: 'uniformes', name: 'Uniformes', slug: 'uniformes', icon: '👕', color: 'bg-blue-100', type: 'article', order: 1, isActive: true },
        { id: 'libros', name: 'Libros', slug: 'libros', icon: '📚', color: 'bg-green-100', type: 'article', order: 2, isActive: true },
        { id: 'utiles', name: 'Útiles', slug: 'utiles', icon: '✏️', color: 'bg-yellow-100', type: 'article', order: 3, isActive: true },
        { id: 'deportes', name: 'Deportes', slug: 'deportes', icon: '⚽', color: 'bg-red-100', type: 'article', order: 4, isActive: true },
        { id: 'tecnologia', name: 'Tecnología', slug: 'tecnologia', icon: '💻', color: 'bg-purple-100', type: 'article', order: 5, isActive: true },
        { id: 'otros', name: 'Otros', slug: 'otros', icon: '📦', color: 'bg-gray-100', type: 'article', order: 6, isActive: true },
    ];

    const serviceCategories: Category[] = [
        { id: 'tutoring', name: 'Clases Particulares', slug: 'tutoring', icon: '📖', color: 'bg-indigo-100', type: 'service', order: 1, isActive: true },
        { id: 'transport', name: 'Transporte', slug: 'transport', icon: '🚐', color: 'bg-orange-100', type: 'service', order: 2, isActive: true },
        { id: 'catering', name: 'Colaciones', slug: 'catering', icon: '🍱', color: 'bg-amber-100', type: 'service', order: 3, isActive: true },
        { id: 'events', name: 'Eventos', slug: 'events', icon: '🎉', color: 'bg-pink-100', type: 'service', order: 4, isActive: true },
        { id: 'repairs', name: 'Reparaciones', slug: 'repairs', icon: '🔧', color: 'bg-slate-100', type: 'service', order: 5, isActive: true },
        { id: 'other', name: 'Otros', slug: 'other', icon: '🛠️', color: 'bg-gray-100', type: 'service', order: 6, isActive: true },
    ];

    if (type === 'article') return articleCategories;
    if (type === 'service') return serviceCategories;
    return [...articleCategories, ...serviceCategories];
}
