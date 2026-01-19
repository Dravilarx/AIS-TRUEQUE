import { Timestamp } from 'firebase-admin/firestore';

// ============================================
// User Types
// ============================================

export interface User {
    id: string;
    email: string;
    displayName: string;
    photoURL?: string;
    phone?: string;
    membership: Membership;
    preferences: UserPreferences;
    stats: UserStats;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface Membership {
    status: 'active' | 'expired' | 'pending';
    expiresAt: Timestamp;
    plan: 'monthly' | 'quarterly' | 'annual';
    startedAt: Timestamp;
    autoRenew: boolean;
}

export interface UserPreferences {
    grades: string[];
    sizes: string[];
    categories: string[];
}

export interface UserStats {
    articlesPublished: number;
    totalSales: number;
    averageRating: number;
    ratingsCount: number;
}

// ============================================
// Article Types
// ============================================

export type ArticleCategory =
    | 'uniformes'
    | 'libros'
    | 'utiles'
    | 'deportes'
    | 'tecnologia'
    | 'otros';

export type ArticleCondition = 'new' | 'like_new' | 'good' | 'fair';
export type ArticleStatus = 'active' | 'reserved' | 'sold' | 'inactive';

export interface ArticleMetadata {
    grade?: string;
    size?: string;
    brand?: string;
}

export interface Article {
    id: string;
    sellerId: string;
    title: string;
    description: string;
    category: ArticleCategory;
    subcategory?: string;
    price: number;
    priceNegotiable: boolean;
    condition: ArticleCondition;
    metadata: ArticleMetadata;
    images: string[];
    status: ArticleStatus;
    views: number;
    favorites: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// ============================================
// Service Provider Types
// ============================================

export type ServiceCategory =
    | 'tutoring'
    | 'transport'
    | 'catering'
    | 'events'
    | 'repairs'
    | 'other';

export interface ServiceProvider {
    id: string;
    userId: string;
    businessName: string;
    description: string;
    category: ServiceCategory;
    contact: {
        phone?: string;
        email?: string;
        whatsapp?: string;
    };
    verification: {
        status: 'pending' | 'verified' | 'rejected';
        verifiedBy?: string;
        verifiedAt?: Timestamp;
    };
    images: string[];
    stats: {
        averageRating: number;
        ratingsCount: number;
        recommendations: number;
    };
    isActive: boolean;
    createdAt: Timestamp;
}

// ============================================
// Rating Types
// ============================================

export type RatingScore = 1 | 2 | 3 | 4 | 5;

export interface Rating {
    id: string;
    targetType: 'article' | 'service';
    targetId: string;
    targetOwnerId: string;
    reviewerId: string;
    score: RatingScore;
    comment?: string;
    recommends?: boolean;
    createdAt: Timestamp;
}

// ============================================
// Request Types
// ============================================

export interface AuthenticatedRequest extends Express.Request {
    user?: {
        uid: string;
        email?: string;
    };
    userData?: User;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
    pagination?: {
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
    };
}
