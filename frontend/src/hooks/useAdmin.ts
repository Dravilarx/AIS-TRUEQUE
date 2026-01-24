import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface UseAdminReturn {
    isAdmin: boolean;
    loading: boolean;
    user: User | null;
}

/**
 * Hook to check if the current user has admin privileges
 */
export const useAdmin = (): UseAdminReturn => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                try {
                    // Force token refresh to get latest custom claims
                    const idTokenResult = await currentUser.getIdTokenResult(true);

                    // Check if user has admin custom claim
                    setIsAdmin(idTokenResult.claims.admin === true);
                } catch (error) {
                    console.error('Error checking admin status:', error);
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { isAdmin, loading, user };
};
