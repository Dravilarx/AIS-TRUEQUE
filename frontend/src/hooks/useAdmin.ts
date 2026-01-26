import { useAuth } from './useAuth';

interface UseAdminReturn {
    isAdmin: boolean;
    loading: boolean;
    user: any; // Using any for compatibility or can import User from firebase/auth
}

/**
 * Hook to check if the current user has admin privileges
 * Now consumes from AuthContext for consistency and performance
 */
export const useAdmin = (): UseAdminReturn => {
    const { isAdmin, loading, firebaseUser } = useAuth();
    return { isAdmin, loading, user: firebaseUser };
};
