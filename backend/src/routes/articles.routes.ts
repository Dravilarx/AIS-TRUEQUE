import { Router } from 'express';
import {
    getArticles,
    getArticle,
    createArticle,
    updateArticle,
    deleteArticle,
    getMyArticles,
} from '../controllers/articles.controller';
import { authMiddleware, membershipMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes (still require auth but not membership check for viewing)
router.get('/', authMiddleware, getArticles);
router.get('/my-listings', authMiddleware, getMyArticles);
router.get('/:id', authMiddleware, getArticle);

// Protected routes (require active membership)
router.post('/', authMiddleware, membershipMiddleware, createArticle);
router.put('/:id', authMiddleware, membershipMiddleware, updateArticle);
router.delete('/:id', authMiddleware, membershipMiddleware, deleteArticle);

export default router;
