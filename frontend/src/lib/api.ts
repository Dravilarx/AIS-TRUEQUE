import axios from 'axios';
import { auth } from './firebase';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    async (config) => {
        const user = auth.currentUser;
        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - redirect to login
            window.location.href = '/login';
        }
        if (error.response?.status === 403) {
            // Membership expired - redirect to membership page
            window.location.href = '/membership';
        }
        return Promise.reject(error);
    }
);

export default api;
