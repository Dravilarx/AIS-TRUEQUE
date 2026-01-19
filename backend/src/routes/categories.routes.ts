import { Router } from 'express';
import {
    getCategories,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    seedCategories,
} from '../controllers/categories.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';

const router = Router();

// Public routes
router.get('/', getCategories);

// Admin routes
router.get('/admin/all', authMiddleware, adminMiddleware, getAllCategories);
router.post('/', authMiddleware, adminMiddleware, createCategory);
router.put('/:id', authMiddleware, adminMiddleware, updateCategory);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCategory);
router.post('/reorder', authMiddleware, adminMiddleware, reorderCategories);
router.post('/seed', authMiddleware, adminMiddleware, seedCategories);

export default router;
