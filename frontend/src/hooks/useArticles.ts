import { useState, useCallback, useRef } from 'react';
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

import { prepareForFirestore } from '@/lib/firestore-utils';

export function useArticles() {
    const { user, firebaseUser } = useAuth();
    const [articles, setArticles] = useState<ArticleWithSeller[]>([]);
    const [myArticles, setMyArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const lastDocRef = useRef<DocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [currentFilters, setCurrentFilters] = useState<ArticleFilters>({});

    // ... (buildQuery stays the same) ...
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
                const lastDoc = lastDocRef.current;

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

                lastDocRef.current = snapshot.docs[snapshot.docs.length - 1] || null;
                setHasMore(snapshot.docs.length === PAGE_SIZE);
            } catch (error) {
                console.error('Error fetching articles:', error);
                toast.error('Error al cargar artículos');
            } finally {
                setLoading(false);
            }
        },
        [buildQuery]
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

    // Create new article - RADICAL SANITIZATION APPLIED
    const createArticle = useCallback(
        async (articleData: Omit<Article, 'id' | 'sellerId' | 'views' | 'favorites' | 'createdAt' | 'updatedAt' | 'status'>) => {
            if (!firebaseUser?.uid) {
                toast.error('Sesión no válida. Recarga la página.');
                return null;
            }

            try {
                setLoading(true);
                const now = Timestamp.now();

                // 1. Construct the object locally
                const rawArticle = {
                    ...articleData,
                    sellerId: firebaseUser.uid,
                    status: 'active',
                    views: 0,
                    favorites: 0,
                    createdAt: now,
                    updatedAt: now,
                };

                // 2. SANITIZE IT: This strips ALL undefined values recursively
                const cleanArticle = prepareForFirestore(rawArticle);

                console.log('📝 Attempting to write sanitized article:', cleanArticle);

                const docRef = await addDoc(collection(db, ARTICLES_COLLECTION), cleanArticle);

                return { id: docRef.id, ...cleanArticle } as Article;
            } catch (error) {
                console.error('🔥 CRITICAL Error creating article:', error);
                toast.error('Error crítico al guardar. Ver consola.');
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [firebaseUser]
    );

    // Update article - RADICAL SANITIZATION APPLIED
    const updateArticle = useCallback(
        async (id: string, updates: Partial<Article>) => {
            try {
                setLoading(true);
                const docRef = doc(db, ARTICLES_COLLECTION, id);

                const updatesWithTimestamp = {
                    ...updates,
                    updatedAt: Timestamp.now(),
                };

                // Sanitize before update
                const cleanUpdates = prepareForFirestore(updatesWithTimestamp);

                await updateDoc(docRef, cleanUpdates);

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

    // Fetch user's articles - STRICT GUARD
    const fetchMyArticles = useCallback(async () => {
        // Strict guard: If there is no UID, we DO NOT QUERY. Period.
        const uid = firebaseUser?.uid;

        if (!uid) {
            console.log('⏸️ fetchMyArticles skipped: No UID yet.');
            return;
        }

        try {
            setLoading(true);
            const q = query(
                collection(db, ARTICLES_COLLECTION),
                where('sellerId', '==', uid),
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
        } finally {
            setLoading(false);
        }
    }, [firebaseUser]); // We react to firebaseUser changes

    // Get user's articles (legacy)
    const getMyArticles = useCallback(async () => {
        const uid = firebaseUser?.uid;
        if (!uid) return [];

        try {
            setLoading(true);
            const q = query(
                collection(db, ARTICLES_COLLECTION),
                where('sellerId', '==', uid),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Article[];
        } catch (error) {
            console.error('Error fetching my articles:', error);
            return [];
        } finally {
            setLoading(false);
        }
    }, [firebaseUser]);

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
