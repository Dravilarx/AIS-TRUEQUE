import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser,
    updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType {
    user: User | null;
    userData: User | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName: string) => Promise<void>;
    signOut: () => Promise<void>;
    isMembershipActive: boolean;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch user data from Firestore
    const fetchUserData = useCallback(async (uid: string): Promise<User | null> => {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                return { id: userDoc.id, ...userDoc.data() } as User;
            }
            return null;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    }, []);

    // Create initial user document
    const createUserDocument = useCallback(
        async (firebaseUser: FirebaseUser, displayName: string): Promise<User> => {
            const now = Timestamp.now();
            const oneYearFromNow = Timestamp.fromDate(
                new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            );

            const newUser: Omit<User, 'id'> = {
                email: firebaseUser.email!,
                displayName,
                photoURL: firebaseUser.photoURL || undefined,
                membership: {
                    status: 'pending',
                    expiresAt: oneYearFromNow,
                    plan: 'annual',
                },
                preferences: {
                    grades: [],
                    sizes: [],
                    categories: [],
                },
                stats: {
                    articlesPublished: 0,
                    totalSales: 0,
                    averageRating: 0,
                    ratingsCount: 0,
                },
                createdAt: now,
                updatedAt: now,
            };

            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            return { id: firebaseUser.uid, ...newUser };
        },
        []
    );

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setFirebaseUser(firebaseUser);

            if (firebaseUser) {
                const userData = await fetchUserData(firebaseUser.uid);
                setUser(userData);
            } else {
                setUser(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, [fetchUserData]);

    // Sign in
    const signIn = useCallback(async (email: string, password: string) => {
        try {
            setLoading(true);
            await signInWithEmailAndPassword(auth, email, password);
            toast.success('¡Bienvenido de vuelta!');
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : 'Error al iniciar sesión';
            toast.error(message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    // Sign up
    const signUp = useCallback(
        async (email: string, password: string, displayName: string) => {
            try {
                setLoading(true);
                const { user: firebaseUser } = await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

                await updateProfile(firebaseUser, { displayName });

                console.log('Creando documento de usuario en Firestore...');
                const userData = await createUserDocument(firebaseUser, displayName);

                // Aseguramos que el estado del usuario esté seteado antes de terminar el loading
                setUser(userData);
                toast.success('¡Cuenta creada exitosamente!');
            } catch (error: unknown) {
                console.error('Error detallado en signUp:', error);
                const message =
                    error instanceof Error ? error.message : 'Error al crear cuenta';
                toast.error(`Error: ${message}`);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [createUserDocument]
    );

    // Sign out
    const signOut = useCallback(async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
            toast.success('Sesión cerrada');
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : 'Error al cerrar sesión';
            toast.error(message);
            throw error;
        }
    }, []);

    // Check membership status
    const isMembershipActive = (() => {
        if (!user?.membership) return false;
        if (user.membership.status !== 'active') return false;

        const expiresAt = user.membership.expiresAt;
        if (!expiresAt) return false;

        // Handle both Firestore Timestamp and regular Date
        let expirationDate: Date;
        if (typeof expiresAt.toDate === 'function') {
            expirationDate = expiresAt.toDate();
        } else if (expiresAt instanceof Date) {
            expirationDate = expiresAt;
        } else if (typeof expiresAt === 'object' && expiresAt.seconds) {
            // Handle raw Firestore timestamp object
            expirationDate = new Date(expiresAt.seconds * 1000);
        } else {
            return false;
        }

        return expirationDate > new Date();
    })();

    const value: AuthContextType = {
        user,
        userData: user,
        firebaseUser,
        loading,
        signIn,
        signUp,
        signOut,
        isMembershipActive,
    };


    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
