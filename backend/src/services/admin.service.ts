import admin from '../config/firebase';

const db = admin.firestore();
const auth = admin.auth();

export interface AdminUser {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    disabled?: boolean;
    isAdmin?: boolean;
    createdAt?: any;
    updatedAt?: any;
}

export interface AdminUserUpdate {
    disabled?: boolean;
    admin?: boolean;
    displayName?: string;
    email?: string;
}

export interface UserListResponse {
    users: AdminUser[];
    nextPageToken?: string;
    total: number;
}

/**
 * List all users from Firestore with pagination
 */
export const listUsers = async (
    maxResults: number = 100,
    pageToken?: string
): Promise<UserListResponse> => {
    try {
        const usersRef = db.collection('users');
        let query = usersRef.orderBy('createdAt', 'desc').limit(maxResults);

        if (pageToken) {
            const lastDoc = await usersRef.doc(pageToken).get();
            if (lastDoc.exists) {
                query = query.startAfter(lastDoc);
            }
        }

        const snapshot = await query.get();
        const users: AdminUser[] = [];

        snapshot.forEach(doc => {
            users.push({
                uid: doc.id,
                ...doc.data()
            } as AdminUser);
        });

        return {
            users,
            nextPageToken: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : undefined,
            total: users.length
        };
    } catch (error) {
        console.error('Error listing users:', error);
        throw new Error('Failed to list users');
    }
};

/**
 * Get user by ID from Firestore
 */
export const getUserById = async (uid: string): Promise<AdminUser> => {
    try {
        const userDoc = await db.collection('users').doc(uid).get();

        if (!userDoc.exists) {
            throw new Error('User not found');
        }

        return {
            uid: userDoc.id,
            ...userDoc.data()
        } as AdminUser;
    } catch (error) {
        console.error('Error getting user:', error);
        throw new Error('User not found');
    }
};

/**
 * Update user information in Firestore
 */
export const updateUser = async (
    uid: string,
    updates: AdminUserUpdate
): Promise<AdminUser> => {
    try {
        const userRef = db.collection('users').doc(uid);

        const firestoreUpdates: any = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (updates.displayName !== undefined) {
            firestoreUpdates.displayName = updates.displayName;
        }
        if (updates.email !== undefined) {
            firestoreUpdates.email = updates.email;
        }
        if (updates.disabled !== undefined) {
            firestoreUpdates.disabled = updates.disabled;
        }
        if (updates.admin !== undefined) {
            firestoreUpdates.isAdmin = updates.admin;
        }

        await userRef.update(firestoreUpdates);

        // Update custom claims if admin status is being changed
        if (typeof updates.admin === 'boolean') {
            try {
                await auth.setCustomUserClaims(uid, { admin: updates.admin });
            } catch (error) {
                console.warn('Could not update Firebase Auth custom claims (missing permissions):', error);
                // Continue anyway - Firestore is updated
            }
        }

        const updatedDoc = await userRef.get();
        return {
            uid: updatedDoc.id,
            ...updatedDoc.data()
        } as AdminUser;
    } catch (error) {
        console.error('Error updating user:', error);
        throw new Error('Failed to update user');
    }
};

/**
 * Set admin role for a user (Firestore + Auth custom claims)
 */
export const setAdminRole = async (uid: string, isAdmin: boolean): Promise<void> => {
    try {
        // Update Firestore (this will always work)
        const userRef = db.collection('users').doc(uid);
        await userRef.update({
            isAdmin,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Try to update custom claims (may fail if no permissions)
        try {
            await auth.setCustomUserClaims(uid, { admin: isAdmin });
        } catch (error) {
            console.warn('Could not update Firebase Auth custom claims (missing permissions):', error);
            // Continue anyway - Firestore is updated
        }
    } catch (error) {
        console.error('Error setting admin role:', error);
        throw new Error('Failed to set admin role');
    }
};

/**
 * Disable/Enable user account (Firestore only)
 */
export const setUserStatus = async (uid: string, disabled: boolean): Promise<void> => {
    try {
        const userRef = db.collection('users').doc(uid);
        await userRef.update({
            disabled,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Try to update Firebase Auth (may fail if no permissions)
        try {
            await auth.updateUser(uid, { disabled });
        } catch (error) {
            console.warn('Could not update Firebase Auth status (missing permissions):', error);
            // Continue anyway - Firestore is updated
        }
    } catch (error) {
        console.error('Error setting user status:', error);
        throw new Error('Failed to update user status');
    }
};

/**
 * Delete user account and all associated data (articles, services)
 */
export const deleteUser = async (uid: string): Promise<void> => {
    const batch = db.batch();

    try {
        // 1. Find and delete user's articles
        const articlesSnapshot = await db.collection('articles').where('sellerId', '==', uid).get();
        articlesSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        // 2. Find and delete user's services
        const servicesSnapshot = await db.collection('services').where('providerId', '==', uid).get();
        servicesSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        // 3. Delete user document from Firestore
        const userRef = db.collection('users').doc(uid);
        batch.delete(userRef);

        // Commit all Firestore deletions
        await batch.commit();

        // 4. Delete from Firebase Auth
        try {
            await auth.deleteUser(uid);
        } catch (error) {
            console.warn('Could not delete from Firebase Auth (missing permissions or already deleted):', error);
            // Continue as Firestore data is purged
        }
    } catch (error) {
        console.error('Error in cascading user deletion:', error);
        throw new Error('Failed to delete user and associated data');
    }
};

/**
 * Get user statistics from Firestore
 */
export const getUserStats = async (): Promise<{
    totalUsers: number;
    activeUsers: number;
    disabledUsers: number;
    adminUsers: number;
}> => {
    try {
        const usersSnapshot = await db.collection('users').get();

        let totalUsers = 0;
        let activeUsers = 0;
        let disabledUsers = 0;
        let adminUsers = 0;

        usersSnapshot.forEach(doc => {
            const user = doc.data();
            totalUsers++;

            if (user.disabled) {
                disabledUsers++;
            } else {
                activeUsers++;
            }

            if (user.isAdmin) {
                adminUsers++;
            }
        });

        return {
            totalUsers,
            activeUsers,
            disabledUsers,
            adminUsers
        };
    } catch (error) {
        console.error('Error getting user stats:', error);
        throw new Error('Failed to get user statistics');
    }
};
