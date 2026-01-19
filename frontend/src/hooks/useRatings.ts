import { useState, useCallback } from 'react';
import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp,
    runTransaction,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { Rating } from '@/types';
import toast from 'react-hot-toast';

const COLLECTION = 'ratings';

export function useRatings() {
    const { user } = useAuth();
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch ratings for a target (article seller or service)
    const fetchRatings = useCallback(async (targetId: string, targetType: 'user' | 'service') => {
        try {
            setLoading(true);

            const q = query(
                collection(db, COLLECTION),
                where('targetId', '==', targetId),
                where('targetType', '==', targetType),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Rating[];

            setRatings(data);
            return data;
        } catch (error) {
            console.error('Error fetching ratings:', error);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Check if user has already rated
    const hasUserRated = useCallback(async (targetId: string, targetType: 'user' | 'service'): Promise<boolean> => {
        if (!user) return false;

        try {
            const q = query(
                collection(db, COLLECTION),
                where('targetId', '==', targetId),
                where('targetType', '==', targetType),
                where('reviewerId', '==', user.uid)
            );

            const snapshot = await getDocs(q);
            return !snapshot.empty;
        } catch (error) {
            console.error('Error checking rating:', error);
            return false;
        }
    }, [user]);

    // Create a rating
    const createRating = useCallback(async (
        targetId: string,
        targetType: 'user' | 'service',
        data: {
            score: {
                overall: number;
                communication?: number;
                quality?: number;
                punctuality?: number;
            };
            comment: string;
            transactionId?: string;
            recommend?: boolean;
        }
    ): Promise<boolean> => {
        if (!user) {
            toast.error('Debes iniciar sesión');
            return false;
        }

        try {
            setLoading(true);

            // Check if already rated
            const alreadyRated = await hasUserRated(targetId, targetType);
            if (alreadyRated) {
                toast.error('Ya has calificado anteriormente');
                return false;
            }

            const ratingData = {
                targetId,
                targetType,
                reviewerId: user.uid,
                reviewerName: user.displayName || 'Usuario',
                score: data.score,
                comment: data.comment.trim(),
                transactionId: data.transactionId || null,
                recommend: data.recommend ?? true,
                createdAt: Timestamp.now(),
            };

            // Use transaction to update both rating and target stats
            await runTransaction(db, async (transaction) => {
                // Add rating
                const ratingRef = doc(collection(db, COLLECTION));
                transaction.set(ratingRef, ratingData);

                // Update target stats
                const targetCollection = targetType === 'user' ? 'users' : 'services';
                const targetRef = doc(db, targetCollection, targetId);

                // Get current stats
                const targetDoc = await transaction.get(targetRef);
                if (targetDoc.exists()) {
                    const currentStats = targetDoc.data().stats || {
                        averageRating: 0,
                        ratingsCount: 0,
                        recommendations: 0,
                    };

                    const newCount = currentStats.ratingsCount + 1;
                    const newAverage =
                        (currentStats.averageRating * currentStats.ratingsCount + data.score.overall) / newCount;
                    const newRecommendations = currentStats.recommendations + (data.recommend ? 1 : 0);

                    transaction.update(targetRef, {
                        'stats.averageRating': Math.round(newAverage * 10) / 10,
                        'stats.ratingsCount': newCount,
                        'stats.recommendations': newRecommendations,
                    });
                }
            });

            toast.success('¡Gracias por tu calificación!');
            return true;
        } catch (error) {
            console.error('Error creating rating:', error);
            toast.error('Error al enviar calificación');
            return false;
        } finally {
            setLoading(false);
        }
    }, [user, hasUserRated]);

    // Get rating summary for a target
    const getRatingSummary = useCallback(async (targetId: string, targetType: 'user' | 'service') => {
        try {
            const q = query(
                collection(db, COLLECTION),
                where('targetId', '==', targetId),
                where('targetType', '==', targetType)
            );

            const snapshot = await getDocs(q);
            const ratings = snapshot.docs.map((doc) => doc.data() as Rating);

            if (ratings.length === 0) {
                return {
                    averageRating: 0,
                    totalRatings: 0,
                    recommendations: 0,
                    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                };
            }

            const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            let totalScore = 0;
            let recommendations = 0;

            ratings.forEach((rating) => {
                const score = Math.round(rating.score.overall);
                distribution[score] = (distribution[score] || 0) + 1;
                totalScore += rating.score.overall;
                if (rating.recommend) recommendations++;
            });

            return {
                averageRating: Math.round((totalScore / ratings.length) * 10) / 10,
                totalRatings: ratings.length,
                recommendations,
                distribution,
            };
        } catch (error) {
            console.error('Error getting rating summary:', error);
            return null;
        }
    }, []);

    return {
        ratings,
        loading,
        fetchRatings,
        hasUserRated,
        createRating,
        getRatingSummary,
    };
}
