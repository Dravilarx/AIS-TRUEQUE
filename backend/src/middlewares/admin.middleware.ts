import { Request, Response, NextFunction } from 'express';
import { db } from '../config/firebase';
import { AuthRequest } from './auth.middleware';

/**
 * Middleware to check if user is admin
 */
export const adminMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                },
            });
            return;
        }

        const userDoc = await db.collection('users').doc(req.user.uid).get();

        if (!userDoc.exists) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User profile not found',
                },
            });
            return;
        }

        const userData = userDoc.data();

        if (userData?.role !== 'admin') {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Admin access required',
                },
            });
            return;
        }

        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Error checking admin status',
            },
        });
    }
};
