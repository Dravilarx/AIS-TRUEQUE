import { Request, Response, NextFunction } from 'express';
import { auth, db } from '../config/firebase';
import { User } from '../types';

// Extended Request with user data
export interface AuthRequest extends Request {
    user?: {
        uid: string;
        email?: string;
    };
    userData?: User;
}

/**
 * Middleware to verify Firebase ID token
 */
export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'No authorization token provided',
                },
            });
            return;
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: 'Invalid or expired authentication token',
            },
        });
    }
};

/**
 * Middleware to check if user has active membership
 */
export const membershipMiddleware = async (
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

        const userData = { id: userDoc.id, ...userDoc.data() } as User;
        const membership = userData.membership;

        if (membership.status !== 'active') {
            res.status(403).json({
                success: false,
                error: {
                    code: 'MEMBERSHIP_INACTIVE',
                    message: 'Your membership is not active',
                },
            });
            return;
        }

        if (membership.expiresAt.toDate() < new Date()) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'MEMBERSHIP_EXPIRED',
                    message: 'Your membership has expired',
                },
            });
            return;
        }

        req.userData = userData;
        next();
    } catch (error) {
        console.error('Membership middleware error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Error checking membership status',
            },
        });
    }
};
