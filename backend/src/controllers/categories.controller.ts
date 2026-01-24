import { Request, Response } from 'express';
import { categoriesService, CategoryInput } from '../services/categories.service';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Get all active categories
 */
export const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const { type } = req.query;

        const categories = await categoriesService.getCategories(
            type as 'article' | 'service' | undefined
        );

        res.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        console.error('Error getting categories:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Error fetching categories',
            },
        });
    }
};

/**
 * Get all categories (admin)
 */
export const getAllCategories = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const categories = await categoriesService.getAllCategories();

        res.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        console.error('Error getting all categories:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Error fetching categories',
            },
        });
    }
};

/**
 * Create category (admin)
 */
export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, slug, icon, color, type, order } = req.body;

        if (!name || !slug || !type) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Name, slug, and type are required',
                },
            });
            return;
        }

        const input: CategoryInput = {
            name,
            slug,
            icon: icon || '📦',
            color: color || 'bg-gray-100',
            type,
            order,
        };

        const category = await categoriesService.createCategory(input);

        res.status(201).json({
            success: true,
            data: category,
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Error creating category',
            },
        });
    }
};

/**
 * Update category (admin)
 */
export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const updates = req.body;

        const category = await categoriesService.updateCategory(id, updates);

        if (!category) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Category not found',
                },
            });
            return;
        }

        res.json({
            success: true,
            data: category,
        });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Error updating category',
            },
        });
    }
};

/**
 * Delete category (admin)
 */
export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const deleted = await categoriesService.deleteCategory(id);

        if (!deleted) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Category not found',
                },
            });
            return;
        }

        res.json({
            success: true,
            data: { deleted: true },
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Error deleting category',
            },
        });
    }
};

/**
 * Reorder categories (admin)
 */
export const reorderCategories = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { categoryIds } = req.body;

        if (!Array.isArray(categoryIds)) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'categoryIds must be an array',
                },
            });
            return;
        }

        await categoriesService.reorderCategories(categoryIds);

        res.json({
            success: true,
            data: { reordered: true },
        });
    } catch (error) {
        console.error('Error reordering categories:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Error reordering categories',
            },
        });
    }
};

/**
 * Seed default categories (admin)
 */
export const seedCategories = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        await categoriesService.seedDefaultCategories();

        res.json({
            success: true,
            data: { seeded: true },
        });
    } catch (error) {
        console.error('Error seeding categories:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Error seeding categories',
            },
        });
    }
};
