import { Router, Request, Response } from 'express';
import { verifyToken, verifyAdmin } from '../middleware/auth.middleware';
import * as adminService from '../services/admin.service';

const router = Router();

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(verifyAdmin);

/**
 * GET /api/admin/users
 * List all users with pagination
 */
router.get('/users', async (req: Request, res: Response): Promise<void> => {
    try {
        const maxResults = parseInt(req.query.maxResults as string) || 100;
        const pageToken = req.query.pageToken as string;

        const result = await adminService.listUsers(maxResults, pageToken);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error listing users:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to list users'
        });
    }
});

/**
 * GET /api/admin/users/stats
 * Get user statistics
 */
router.get('/users/stats', async (req: Request, res: Response): Promise<void> => {
    try {
        const stats = await adminService.getUserStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error getting user stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user statistics'
        });
    }
});

/**
 * GET /api/admin/users/:uid
 * Get user by ID
 */
router.get('/users/:uid', async (req: Request, res: Response): Promise<void> => {
    try {
        const { uid } = req.params;
        const user = await adminService.getUserById(uid);

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }
});

/**
 * PUT /api/admin/users/:uid
 * Update user information
 */
router.put('/users/:uid', async (req: Request, res: Response): Promise<void> => {
    try {
        const { uid } = req.params;
        const updates = req.body;

        const updatedUser = await adminService.updateUser(uid, updates);

        res.json({
            success: true,
            data: updatedUser,
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user'
        });
    }
});

/**
 * POST /api/admin/users/:uid/set-admin
 * Set or remove admin role
 */
router.post('/users/:uid/set-admin', async (req: Request, res: Response): Promise<void> => {
    try {
        const { uid } = req.params;
        const { isAdmin } = req.body;

        if (typeof isAdmin !== 'boolean') {
            res.status(400).json({
                success: false,
                error: 'isAdmin must be a boolean'
            });
            return;
        }

        await adminService.setAdminRole(uid, isAdmin);

        res.json({
            success: true,
            message: `User ${isAdmin ? 'granted' : 'removed'} admin role`
        });
    } catch (error) {
        console.error('Error setting admin role:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to set admin role'
        });
    }
});

/**
 * POST /api/admin/users/:uid/set-status
 * Enable or disable user account
 */
router.post('/users/:uid/set-status', async (req: Request, res: Response): Promise<void> => {
    try {
        const { uid } = req.params;
        const { disabled } = req.body;

        if (typeof disabled !== 'boolean') {
            res.status(400).json({
                success: false,
                error: 'disabled must be a boolean'
            });
            return;
        }

        await adminService.setUserStatus(uid, disabled);

        res.json({
            success: true,
            message: `User ${disabled ? 'disabled' : 'enabled'} successfully`
        });
    } catch (error) {
        console.error('Error setting user status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user status'
        });
    }
});

/**
 * DELETE /api/admin/users/:uid
 * Delete user account
 */
router.delete('/users/:uid', async (req: Request, res: Response): Promise<void> => {
    try {
        const { uid } = req.params;

        // Prevent self-deletion
        if (req.user?.uid === uid) {
            res.status(400).json({
                success: false,
                error: 'Cannot delete your own account'
            });
            return;
        }

        await adminService.deleteUser(uid);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete user'
        });
    }
});

export default router;
