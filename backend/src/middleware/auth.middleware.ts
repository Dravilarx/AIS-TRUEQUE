import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';

// Extend Express Request to include user info
declare global {
    namespace Express {
        interface Request {
            user?: admin.auth.DecodedIdToken;
        }
    }
}

// Type alias for compatibility
export type AuthRequest = Request;

/**
 * Middleware to verify Firebase ID token
 */
export const verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.split('Bearer ')[1];

        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.user = decodedToken;
            next();
        } catch (error) {
            console.error('Token verification error:', error);
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Middleware to verify admin role
 */
export const verifyAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        // Check if user has admin custom claim
        if (req.user.admin !== true) {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        next();
    } catch (error) {
        console.error('Admin verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Optional authentication - sets user if token is valid but doesn't require it
 */
export const optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split('Bearer ')[1];

            try {
                const decodedToken = await admin.auth().verifyIdToken(token);
                req.user = decodedToken;
            } catch (error) {
                // Token is invalid but we don't fail the request
                console.log('Optional auth: Invalid token');
            }
        }

        next();
    } catch (error) {
        console.error('Optional auth error:', error);
        next();
    }
};

/**
 * Middleware to check if user has active membership
 * For now, this middleware just passes through
 * In the future, implement actual membership checking logic
 */
export const membershipMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    // TODO: Implement membership checking
    // For now, allow all authenticated users
    next();
};

// Compatibility exports - these can be used interchangeably with the main functions
export const authMiddleware = verifyToken;
export const adminMiddleware = verifyAdmin;
