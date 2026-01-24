import { Router, Request, Response } from 'express';
import { auth } from '../config/firebase';
import { AuthRequest, authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * Verify Firebase token
 */
router.post('/verify-token', async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.body;

        if (!token) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Token is required',
                },
            });
            return;
        }

        const decodedToken = await auth.verifyIdToken(token);

        res.json({
            success: true,
            data: {
                uid: decodedToken.uid,
                email: decodedToken.email,
                emailVerified: decodedToken.email_verified,
            },
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: 'Invalid or expired token',
            },
        });
    }
});

/**
 * Get current user info
 */
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        res.json({
            success: true,
            data: {
                uid: req.user?.uid,
                email: req.user?.email,
            },
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Error fetching user info',
            },
        });
    }
});

export default router;
