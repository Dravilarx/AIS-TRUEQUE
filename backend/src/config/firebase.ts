import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
// In production, use environment variable for service account
// In development, you can use a service account JSON file

const getServiceAccount = () => {
    const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountEnv) return undefined;

    try {
        // Try parsing as raw JSON first
        return JSON.parse(serviceAccountEnv);
    } catch (error) {
        // If parsing fails, it might be Base64 encoded (common for Vercel env vars)
        try {
            const buffer = Buffer.from(serviceAccountEnv, 'base64');
            const decoded = buffer.toString('utf-8');
            return JSON.parse(decoded);
        } catch (base64Error) {
            console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', error);
            return undefined;
        }
    }
};

const serviceAccount = getServiceAccount();

if (!admin.apps.length) {
    admin.initializeApp({
        credential: serviceAccount
            ? admin.credential.cert(serviceAccount)
            : admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
}

export const auth = admin.auth();
export const db = admin.firestore();
export const storage = admin.storage();

export default admin;
