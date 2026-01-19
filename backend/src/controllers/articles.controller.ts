import { Request, Response } from 'express';
import { articlesService, ArticleFilters } from '../services/articles.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ArticleCategory, ArticleCondition } from '../types';

/**
 * Get articles with filters
 */
export const getArticles = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            category,
            condition,
            minPrice,
            maxPrice,
            page = '1',
            limit = '12',
        } = req.query;

        const filters: ArticleFilters = {};

        if (category) filters.category = category as ArticleCategory;
        if (condition) filters.condition = condition as ArticleCondition;
        if (minPrice) filters.minPrice = Number(minPrice);
        if (maxPrice) filters.maxPrice = Number(maxPrice);

        const result = await articlesService.getArticles(
            filters,
            Number(page),
            Number(limit)
        );

        res.json({
            success: true,
            data: result.articles,
            pagination: {
                total: result.total,
                page: Number(page),
                limit: Number(limit),
                hasMore: result.hasMore,
            },
        });
    } catch (error) {
        console.error('Error getting articles:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Error fetching articles',
            },
        });
    }
};

/**
 * Get single article by ID
 */
export const getArticle = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const article = await articlesService.getArticleById(id);

        if (!article) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Article not found',
                },
            });
            return;
        }

        res.json({
            success: true,
            data: article,
        });
    } catch (error) {
        console.error('Error getting article:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Error fetching article',
            },
        });
    }
};

/**
 * Create new article
 */
export const createArticle = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { title, description, category, price, condition, images, metadata, priceNegotiable } =
            req.body;

        // Validation
        if (!title || !description || !category || !price || !condition) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Missing required fields',
                },
            });
            return;
        }

        if (!images || images.length < 3) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'At least 3 images are required',
                },
            });
            return;
        }

        const article = await articlesService.createArticle({
            sellerId: req.user!.uid,
            title,
            description,
            category,
            price: Number(price),
            priceNegotiable: Boolean(priceNegotiable),
            condition,
            images,
            metadata: metadata || {},
        });

        res.status(201).json({
            success: true,
            data: article,
        });
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Error creating article',
            },
        });
    }
};

/**
 * Update article
 */
export const updateArticle = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const id = req.params.id as string;
        const updates = req.body;

        const article = await articlesService.updateArticle(
            id,
            req.user!.uid,
            updates
        );

        if (!article) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Article not found',
                },
            });
            return;
        }

        res.json({
            success: true,
            data: article,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error updating article';
        const status = message.includes('Not authorized') ? 403 : 500;

        res.status(status).json({
            success: false,
            error: {
                code: status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR',
                message,
            },
        });
    }
};

/**
 * Delete article
 */
export const deleteArticle = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const id = req.params.id as string;
        const deleted = await articlesService.deleteArticle(id, req.user!.uid);

        if (!deleted) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Article not found',
                },
            });
            return;
        }

        res.json({
            success: true,
            data: { deleted: true },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error deleting article';
        const status = message.includes('Not authorized') ? 403 : 500;

        res.status(status).json({
            success: false,
            error: {
                code: status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR',
                message,
            },
        });
    }
};

/**
 * Get current user's articles
 */
export const getMyArticles = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const articles = await articlesService.getUserArticles(req.user!.uid);

        res.json({
            success: true,
            data: articles,
        });
    } catch (error) {
        console.error('Error getting user articles:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Error fetching your articles',
            },
        });
    }
};
