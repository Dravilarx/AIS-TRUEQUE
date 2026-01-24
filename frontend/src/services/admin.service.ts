import { auth } from '../lib/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Get authorization header with Firebase ID token
 */
async function getAuthHeader(): Promise<{ Authorization: string }> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
}

export interface UserRecord {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    disabled?: boolean;
    isAdmin?: boolean;
    createdAt?: any;
    updatedAt?: any;
}

export interface UserListResponse {
    success: boolean;
    data: {
        users: UserRecord[];
        nextPageToken?: string;
        total: number;
    };
}

export interface UserStatsResponse {
    success: boolean;
    data: {
        totalUsers: number;
        activeUsers: number;
        disabledUsers: number;
        adminUsers: number;
    };
}

/**
 * List all users
 */
export async function listUsers(maxResults: number = 100, pageToken?: string): Promise<UserListResponse> {
    const headers = await getAuthHeader();

    const params = new URLSearchParams({
        maxResults: maxResults.toString(),
        ...(pageToken && { pageToken })
    });

    const response = await fetch(`${API_URL}/api/admin/users?${params}`, {
        headers
    });

    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }

    return response.json();
}

/**
 * Get user statistics
 */
export async function getUserStats(): Promise<UserStatsResponse> {
    const headers = await getAuthHeader();

    const response = await fetch(`${API_URL}/api/admin/users/stats`, {
        headers
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user statistics');
    }

    return response.json();
}

/**
 * Get user by ID
 */
export async function getUserById(uid: string): Promise<{ success: boolean; data: UserRecord }> {
    const headers = await getAuthHeader();

    const response = await fetch(`${API_URL}/api/admin/users/${uid}`, {
        headers
    });

    if (!response.ok) {
        throw new Error('User not found');
    }

    return response.json();
}

/**
 * Update user
 */
export async function updateUser(
    uid: string,
    updates: {
        displayName?: string;
        email?: string;
        disabled?: boolean;
    }
): Promise<{ success: boolean; message: string }> {
    const headers = await getAuthHeader();

    const response = await fetch(`${API_URL}/api/admin/users/${uid}`, {
        method: 'PUT',
        headers: {
            ...headers,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
    });

    if (!response.ok) {
        throw new Error('Failed to update user');
    }

    return response.json();
}

/**
 * Set admin role
 */
export async function setAdminRole(uid: string, isAdmin: boolean): Promise<{ success: boolean; message: string }> {
    const headers = await getAuthHeader();

    const response = await fetch(`${API_URL}/api/admin/users/${uid}/set-admin`, {
        method: 'POST',
        headers: {
            ...headers,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isAdmin })
    });

    if (!response.ok) {
        throw new Error('Failed to set admin role');
    }

    return response.json();
}

/**
 * Set user status (enable/disable)
 */
export async function setUserStatus(uid: string, disabled: boolean): Promise<{ success: boolean; message: string }> {
    const headers = await getAuthHeader();

    const response = await fetch(`${API_URL}/api/admin/users/${uid}/set-status`, {
        method: 'POST',
        headers: {
            ...headers,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ disabled })
    });

    if (!response.ok) {
        throw new Error('Failed to update user status');
    }

    return response.json();
}

/**
 * Delete user
 */
export async function deleteUser(uid: string): Promise<{ success: boolean; message: string }> {
    const headers = await getAuthHeader();

    const response = await fetch(`${API_URL}/api/admin/users/${uid}`, {
        method: 'DELETE',
        headers
    });

    if (!response.ok) {
        throw new Error('Failed to delete user');
    }

    return response.json();
}
