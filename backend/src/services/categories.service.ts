import { db } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
    type: 'article' | 'service';
    order: number;
    isActive: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface CategoryInput {
    name: string;
    slug: string;
    icon: string;
    color: string;
    type: 'article' | 'service';
    order?: number;
}

const COLLECTION = 'categories';

class CategoriesService {
    /**
     * Get all active categories by type
     */
    async getCategories(type?: 'article' | 'service'): Promise<Category[]> {
        let query = db.collection(COLLECTION).where('isActive', '==', true);

        if (type) {
            query = query.where('type', '==', type);
        }

        const snapshot = await query.orderBy('order', 'asc').get();

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Category[];
    }

    /**
     * Get all categories (including inactive) for admin
     */
    async getAllCategories(): Promise<Category[]> {
        const snapshot = await db
            .collection(COLLECTION)
            .orderBy('type')
            .orderBy('order', 'asc')
            .get();

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Category[];
    }

    /**
     * Create new category (admin only)
     */
    async createCategory(input: CategoryInput): Promise<Category> {
        const now = Timestamp.now();

        // Get max order for this type
        const maxOrderSnapshot = await db
            .collection(COLLECTION)
            .where('type', '==', input.type)
            .orderBy('order', 'desc')
            .limit(1)
            .get();

        const maxOrder = maxOrderSnapshot.empty
            ? 0
            : (maxOrderSnapshot.docs[0].data().order || 0);

        const categoryData = {
            ...input,
            order: input.order ?? maxOrder + 1,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        };

        const docRef = await db.collection(COLLECTION).add(categoryData);

        return { id: docRef.id, ...categoryData } as Category;
    }

    /**
     * Update category (admin only)
     */
    async updateCategory(id: string, updates: Partial<CategoryInput & { isActive: boolean }>): Promise<Category | null> {
        const docRef = db.collection(COLLECTION).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return null;
        }

        const updateData = {
            ...updates,
            updatedAt: Timestamp.now(),
        };

        await docRef.update(updateData);

        const updatedDoc = await docRef.get();
        return { id: updatedDoc.id, ...updatedDoc.data() } as Category;
    }

    /**
     * Delete category (admin only)
     */
    async deleteCategory(id: string): Promise<boolean> {
        const docRef = db.collection(COLLECTION).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return false;
        }

        // Soft delete - just deactivate
        await docRef.update({
            isActive: false,
            updatedAt: Timestamp.now(),
        });

        return true;
    }

    /**
     * Reorder categories (admin only)
     */
    async reorderCategories(categoryIds: string[]): Promise<void> {
        const batch = db.batch();
        const now = Timestamp.now();

        categoryIds.forEach((id, index) => {
            const docRef = db.collection(COLLECTION).doc(id);
            batch.update(docRef, { order: index + 1, updatedAt: now });
        });

        await batch.commit();
    }

    /**
     * Seed default categories
     */
    async seedDefaultCategories(): Promise<void> {
        const existing = await db.collection(COLLECTION).limit(1).get();

        if (!existing.empty) {
            console.log('Categories already exist, skipping seed');
            return;
        }

        const defaultArticleCategories = [
            { name: 'Uniformes', slug: 'uniformes', icon: '👕', color: 'bg-blue-100' },
            { name: 'Libros', slug: 'libros', icon: '📚', color: 'bg-green-100' },
            { name: 'Útiles Escolares', slug: 'utiles', icon: '✏️', color: 'bg-yellow-100' },
            { name: 'Deportes', slug: 'deportes', icon: '⚽', color: 'bg-red-100' },
            { name: 'Tecnología', slug: 'tecnologia', icon: '💻', color: 'bg-purple-100' },
            { name: 'Otros', slug: 'otros', icon: '📦', color: 'bg-gray-100' },
        ];

        const defaultServiceCategories = [
            { name: 'Clases Particulares', slug: 'tutoring', icon: '📖', color: 'bg-indigo-100' },
            { name: 'Transporte Escolar', slug: 'transport', icon: '🚐', color: 'bg-orange-100' },
            { name: 'Colaciones/Almuerzos', slug: 'catering', icon: '🍱', color: 'bg-amber-100' },
            { name: 'Eventos/Cumpleaños', slug: 'events', icon: '🎉', color: 'bg-pink-100' },
            { name: 'Reparaciones', slug: 'repairs', icon: '🔧', color: 'bg-slate-100' },
            { name: 'Otros Servicios', slug: 'other', icon: '🛠️', color: 'bg-gray-100' },
        ];

        const batch = db.batch();
        const now = Timestamp.now();

        defaultArticleCategories.forEach((cat, index) => {
            const docRef = db.collection(COLLECTION).doc();
            batch.set(docRef, {
                ...cat,
                type: 'article',
                order: index + 1,
                isActive: true,
                createdAt: now,
                updatedAt: now,
            });
        });

        defaultServiceCategories.forEach((cat, index) => {
            const docRef = db.collection(COLLECTION).doc();
            batch.set(docRef, {
                ...cat,
                type: 'service',
                order: index + 1,
                isActive: true,
                createdAt: now,
                updatedAt: now,
            });
        });

        await batch.commit();
        console.log('Default categories seeded successfully');
    }
}

export const categoriesService = new CategoriesService();
