import { db } from '../config/firebase';
import { Article, ArticleCategory, ArticleCondition } from '../types';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

const COLLECTION = 'articles';
const PAGE_SIZE = 12;

export interface ArticleFilters {
    category?: ArticleCategory;
    condition?: ArticleCondition;
    minPrice?: number;
    maxPrice?: number;
    sellerId?: string;
    status?: string;
}

export interface CreateArticleInput {
    sellerId: string;
    title: string;
    description: string;
    category: ArticleCategory;
    subcategory?: string;
    price: number;
    priceNegotiable: boolean;
    condition: ArticleCondition;
    metadata: {
        grade?: string;
        size?: string;
        brand?: string;
    };
    images: string[];
}

class ArticlesService {
    /**
     * Get articles with filters and pagination
     */
    async getArticles(
        filters: ArticleFilters = {},
        page = 1,
        limit = PAGE_SIZE
    ): Promise<{ articles: Article[]; total: number; hasMore: boolean }> {
        let query = db.collection(COLLECTION).where('status', '==', 'active');

        if (filters.category) {
            query = query.where('category', '==', filters.category);
        }

        if (filters.condition) {
            query = query.where('condition', '==', filters.condition);
        }

        if (filters.sellerId) {
            query = query.where('sellerId', '==', filters.sellerId);
        }

        // Get total count (simplified - in production use a counter)
        const countSnapshot = await query.count().get();
        const total = countSnapshot.data().count;

        // Get paginated results
        const offset = (page - 1) * limit;
        const snapshot = await query
            .orderBy('createdAt', 'desc')
            .offset(offset)
            .limit(limit)
            .get();

        const articles = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Article[];

        return {
            articles,
            total,
            hasMore: offset + articles.length < total,
        };
    }

    /**
     * Get single article by ID
     */
    async getArticleById(id: string): Promise<Article | null> {
        const doc = await db.collection(COLLECTION).doc(id).get();

        if (!doc.exists) {
            return null;
        }

        // Increment views
        await doc.ref.update({
            views: FieldValue.increment(1),
        });

        return { id: doc.id, ...doc.data() } as Article;
    }

    /**
     * Create new article
     */
    async createArticle(input: CreateArticleInput): Promise<Article> {
        const now = Timestamp.now();

        const articleData = {
            ...input,
            status: 'active',
            views: 0,
            favorites: 0,
            createdAt: now,
            updatedAt: now,
        };

        const docRef = await db.collection(COLLECTION).add(articleData);

        // Update user's article count
        await db
            .collection('users')
            .doc(input.sellerId)
            .update({
                'stats.articlesPublished': FieldValue.increment(1),
            });

        return { id: docRef.id, ...articleData } as Article;
    }

    /**
     * Update article
     */
    async updateArticle(
        id: string,
        sellerId: string,
        updates: Partial<Article>
    ): Promise<Article | null> {
        const docRef = db.collection(COLLECTION).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return null;
        }

        const article = doc.data() as Article;

        // Verify ownership
        if (article.sellerId !== sellerId) {
            throw new Error('Not authorized to update this article');
        }

        const updateData = {
            ...updates,
            updatedAt: Timestamp.now(),
        };

        // Remove fields that shouldn't be updated
        delete (updateData as Partial<Article>).id;
        delete (updateData as Partial<Article>).sellerId;
        delete (updateData as Partial<Article>).createdAt;

        await docRef.update(updateData);

        const updatedDoc = await docRef.get();
        return { id: updatedDoc.id, ...updatedDoc.data() } as Article;
    }

    /**
     * Delete article
     */
    async deleteArticle(id: string, sellerId: string): Promise<boolean> {
        const docRef = db.collection(COLLECTION).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return false;
        }

        const article = doc.data() as Article;

        // Verify ownership
        if (article.sellerId !== sellerId) {
            throw new Error('Not authorized to delete this article');
        }

        await docRef.delete();

        // Update user's article count
        await db
            .collection('users')
            .doc(sellerId)
            .update({
                'stats.articlesPublished': FieldValue.increment(-1),
            });

        return true;
    }

    /**
     * Get user's articles
     */
    async getUserArticles(userId: string): Promise<Article[]> {
        const snapshot = await db
            .collection(COLLECTION)
            .where('sellerId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Article[];
    }
}

export const articlesService = new ArticlesService();
