import { useState, useCallback } from 'react';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    Timestamp,
    DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import type { Article, ArticleFilters, ArticleWithSeller } from '@/types';
import toast from 'react-hot-toast';

const ARTICLES_COLLECTION = 'articles';
const PAGE_SIZE = 12;

export function useArticles() {
    const { user } = useAuth();
    const [articles, setArticles] = useState<ArticleWithSeller[]>([]);
    const [myArticles, setMyArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [currentFilters, setCurrentFilters] = useState<ArticleFilters>({});

    // Build query with filters
    const buildQuery = useCallback((filters: ArticleFilters) => {
        let q = query(
            collection(db, ARTICLES_COLLECTION),
            where('status', '==', 'active'),
            orderBy('createdAt', 'desc'),
            limit(PAGE_SIZE)
        );

        if (filters.category) {
            q = query(q, where('category', '==', filters.category));
        }

        if (filters.condition) {
            q = query(q, where('condition', '==', filters.condition));
        }

        if (filters.minPrice !== undefined) {
            q = query(q, where('price', '>=', filters.minPrice));
        }

        if (filters.maxPrice !== undefined) {
            q = query(q, where('price', '<=', filters.maxPrice));
        }

        return q;
    }, []);

    // Fetch articles with filters
    const fetchArticles = useCallback(
        async (filters: ArticleFilters = {}, reset = true) => {
            try {
                setLoading(true);
                setCurrentFilters(filters);

                let q = buildQuery(filters);

                if (!reset && lastDoc) {
                    q = query(q, startAfter(lastDoc));
                }

                const snapshot = await getDocs(q);
                const newArticles = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as ArticleWithSeller[];

                if (reset) {
                    setArticles(newArticles);
                } else {
                    setArticles((prev) => [...prev, ...newArticles]);
                }

                setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
                setHasMore(snapshot.docs.length === PAGE_SIZE);
            } catch (error) {
                console.error('Error fetching articles:', error);
                toast.error('Error al cargar artículos');
            } finally {
                setLoading(false);
            }
        },
        [buildQuery, lastDoc]
    );

    // Load more articles (pagination)
    const loadMore = useCallback(() => {
        if (hasMore && !loading) {
            fetchArticles(currentFilters, false);
        }
    }, [hasMore, loading, currentFilters, fetchArticles]);

    // Get single article by ID
    const getArticle = useCallback(async (id: string): Promise<Article | null> => {
        try {
            const docRef = doc(db, ARTICLES_COLLECTION, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                // Increment views
                await updateDoc(docRef, { views: (docSnap.data().views || 0) + 1 });
                return { id: docSnap.id, ...docSnap.data() } as Article;
            }

            return null;
        } catch (error) {
            console.error('Error fetching article:', error);
            toast.error('Error al cargar el artículo');
            return null;
        }
    }, []);

    // Create new article
    const createArticle = useCallback(
        async (articleData: Omit<Article, 'id' | 'sellerId' | 'views' | 'favorites' | 'createdAt' | 'updatedAt' | 'status'>) => {
            if (!user) {
                toast.error('Debes iniciar sesión');
                return null;
            }

            try {
                setLoading(true);
                const now = Timestamp.now();

                const newArticle = {
                    ...articleData,
                    sellerId: user.uid,
                    status: 'active',
                    views: 0,
                    favorites: 0,
                    createdAt: now,
                    updatedAt: now,
                };

                const docRef = await addDoc(collection(db, ARTICLES_COLLECTION), newArticle);
                toast.success('¡Artículo publicado!');

                return { id: docRef.id, ...newArticle } as Article;
            } catch (error) {
                console.error('Error creating article:', error);
                toast.error('Error al publicar artículo');
                return null;
            } finally {
                setLoading(false);
            }
        },
        [user]
    );

    // Update article
    const updateArticle = useCallback(
        async (id: string, updates: Partial<Article>) => {
            try {
                setLoading(true);
                const docRef = doc(db, ARTICLES_COLLECTION, id);

                await updateDoc(docRef, {
                    ...updates,
                    updatedAt: Timestamp.now(),
                });

                toast.success('Artículo actualizado');
                return true;
            } catch (error) {
                console.error('Error updating article:', error);
                toast.error('Error al actualizar');
                return false;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // Delete article
    const deleteArticle = useCallback(async (id: string) => {
        try {
            setLoading(true);
            await deleteDoc(doc(db, ARTICLES_COLLECTION, id));
            setArticles((prev) => prev.filter((a) => a.id !== id));
            setMyArticles((prev) => prev.filter((a) => a.id !== id));
            toast.success('Artículo eliminado');
            return true;
        } catch (error) {
            console.error('Error deleting article:', error);
            toast.error('Error al eliminar');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch user's articles
    const fetchMyArticles = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const q = query(
                collection(db, ARTICLES_COLLECTION),
                where('sellerId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const articles = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Article[];

            setMyArticles(articles);
        } catch (error) {
            console.error('Error fetching my articles:', error);
            toast.error('Error al cargar tus artículos');
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Get user's articles (legacy, kept for compatibility)
    const getMyArticles = useCallback(async () => {
        if (!user) return [];

        try {
            setLoading(true);
            const q = query(
                collection(db, ARTICLES_COLLECTION),
                where('sellerId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Article[];
        } catch (error) {
            console.error('Error fetching my articles:', error);
            toast.error('Error al cargar tus artículos');
            return [];
        } finally {
            setLoading(false);
        }
    }, [user]);

    return {
        articles,
        myArticles,
        loading,
        hasMore,
        fetchArticles,
        loadMore,
        getArticle,
        createArticle,
        updateArticle,
        deleteArticle,
        fetchMyArticles,
        getMyArticles,
    };
}
