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
 * Fetches user data from Firestore to verify membership status
 */
export const membershipMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();

        if (!userDoc.exists) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const userData = userDoc.data();
        const membership = userData?.membership;

        if (membership?.status !== 'active') {
            res.status(403).json({ error: 'Active membership required', code: 'MEMBERSHIP_REQUIRED' });
            return;
        }

        // Check expiration
        let expiresAt: Date;
        if (membership.expiresAt?.toDate) {
            expiresAt = membership.expiresAt.toDate();
        } else {
            expiresAt = new Date(membership.expiresAt);
        }

        if (expiresAt < new Date()) {
            res.status(403).json({ error: 'Membership expired', code: 'MEMBERSHIP_EXPIRED' });
            return;
        }

        next();
    } catch (error) {
        console.error('Membership check error:', error);
        res.status(500).json({ error: 'Internal server error checking membership' });
    }
};

// Compatibility exports - these can be used interchangeably with the main functions
export const authMiddleware = verifyToken;
export const adminMiddleware = verifyAdmin;
