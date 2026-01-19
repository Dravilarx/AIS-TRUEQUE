import { useState, useCallback } from 'react';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { ServiceProvider } from '@/types';
import toast from 'react-hot-toast';

const COLLECTION = 'services';

export interface ServiceFilters {
    category?: string;
    verified?: boolean;
}

export function useServices() {
    const { user } = useAuth();
    const [services, setServices] = useState<ServiceProvider[]>([]);
    const [myService, setMyService] = useState<ServiceProvider | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch all active services
    const fetchServices = useCallback(async (filters: ServiceFilters = {}) => {
        try {
            setLoading(true);

            let q = query(
                collection(db, COLLECTION),
                where('isActive', '==', true),
                orderBy('stats.averageRating', 'desc')
            );

            if (filters.category) {
                q = query(q, where('category', '==', filters.category));
            }

            if (filters.verified) {
                q = query(q, where('verification.status', '==', 'verified'));
            }

            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as ServiceProvider[];

            setServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
            toast.error('Error al cargar servicios');
        } finally {
            setLoading(false);
        }
    }, []);

    // Get single service by ID
    const getService = useCallback(async (id: string): Promise<ServiceProvider | null> => {
        try {
            const docRef = doc(db, COLLECTION, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as ServiceProvider;
            }

            return null;
        } catch (error) {
            console.error('Error fetching service:', error);
            toast.error('Error al cargar servicio');
            return null;
        }
    }, []);

    // Get current user's service
    const fetchMyService = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const q = query(
                collection(db, COLLECTION),
                where('userId', '==', user.id)
            );

            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                setMyService({ id: doc.id, ...doc.data() } as ServiceProvider);
            } else {
                setMyService(null);
            }
        } catch (error) {
            console.error('Error fetching my service:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Create service
    const createService = useCallback(
        async (data: {
            businessName: string;
            description: string;
            category: string;
            contact: { phone?: string; email?: string; whatsapp?: string };
            images: string[];
        }) => {
            if (!user) {
                toast.error('Debes iniciar sesión');
                return null;
            }

            try {
                setLoading(true);
                const now = Timestamp.now();

                const serviceData = {
                    userId: user.id,
                    businessName: data.businessName,
                    description: data.description,
                    category: data.category,
                    contact: data.contact,
                    images: data.images,
                    verification: {
                        status: 'pending',
                    },
                    stats: {
                        averageRating: 0,
                        ratingsCount: 0,
                        recommendations: 0,
                    },
                    isActive: true,
                    createdAt: now,
                };

                const docRef = await addDoc(collection(db, COLLECTION), serviceData);
                const newService = { id: docRef.id, ...serviceData } as ServiceProvider;

                setMyService(newService);
                toast.success('¡Servicio registrado! Pendiente de verificación.');

                return newService;
            } catch (error) {
                console.error('Error creating service:', error);
                toast.error('Error al registrar servicio');
                return null;
            } finally {
                setLoading(false);
            }
        },
        [user]
    );

    // Update service
    const updateService = useCallback(
        async (id: string, updates: Partial<ServiceProvider>) => {
            try {
                setLoading(true);
                const docRef = doc(db, COLLECTION, id);

                await updateDoc(docRef, updates);

                if (myService && myService.id === id) {
                    setMyService({ ...myService, ...updates });
                }

                toast.success('Servicio actualizado');
                return true;
            } catch (error) {
                console.error('Error updating service:', error);
                toast.error('Error al actualizar');
                return false;
            } finally {
                setLoading(false);
            }
        },
        [myService]
    );

    // Toggle service active status
    const toggleServiceActive = useCallback(
        async (id: string, isActive: boolean) => {
            return updateService(id, { isActive });
        },
        [updateService]
    );

    return {
        services,
        myService,
        loading,
        fetchServices,
        getService,
        fetchMyService,
        createService,
        updateService,
        toggleServiceActive,
    };
}
