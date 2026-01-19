import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
// In production, use environment variable for service account
// In development, you can use a service account JSON file

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;

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
