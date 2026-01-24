import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
// In production, use environment variable for service account
// In development, you can use a service account JSON file

const getServiceAccount = () => {
    const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountEnv) {
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
            }
        }
    }

    // In development, try to load from file
    if (process.env.NODE_ENV !== 'production') {
        try {
            const path = require('path');
            const fs = require('fs');
            const serviceAccountPath = path.resolve(__dirname, '../../../firebase-service-account.json');

            if (fs.existsSync(serviceAccountPath)) {
                const serviceAccountFile = fs.readFileSync(serviceAccountPath, 'utf8');
                console.log('✅ Using firebase-service-account.json from project root');
                return JSON.parse(serviceAccountFile);
            } else {
                console.warn('⚠️  firebase-service-account.json not found at:', serviceAccountPath);
            }
        } catch (fileError) {
            console.error('Error reading firebase-service-account.json:', fileError);
        }
    }

    return undefined;
};

const serviceAccount = getServiceAccount();

if (!admin.apps.length) {
    if (!serviceAccount) {
        throw new Error(
            'Firebase service account not configured. Please set FIREBASE_SERVICE_ACCOUNT ' +
            'environment variable or place firebase-service-account.json in the backend directory.'
        );
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    console.log('🔥 Firebase Admin initialized successfully');
}

export const auth = admin.auth();
export const db = admin.firestore();
export const storage = admin.storage();

export default admin;
