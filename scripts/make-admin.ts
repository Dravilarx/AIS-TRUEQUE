import * as admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
// The script is in /scripts/, so we go up one level to find the service account in root
const serviceAccountPath = resolve(__dirname, '../firebase-service-account.json');

if (!existsSync(serviceAccountPath)) {
    console.error(`❌ Error: firebase-service-account.json not found at ${serviceAccountPath}`);
    process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
});

const db = admin.firestore();
const auth = admin.auth();

async function makeAdmin(email: string) {
    try {
        console.log(`\n🔍 Searching for user: ${email}...`);
        const user = await auth.getUserByEmail(email);
        const uid = user.uid;

        console.log(`✅ User found (UID: ${uid})`);

        // 1. Set Custom Claims (for Backend API Access)
        console.log('⏳ Setting Firebase Auth custom claims...');
        await auth.setCustomUserClaims(uid, { admin: true });
        console.log('✅ Custom claims set (admin: true)');

        // 2. Update Firestore document (for Frontend UI visibility)
        console.log('⏳ Updating Firestore user document...');
        const userRef = db.collection('users').doc(uid);

        // We use set with merge: true in case the document doesn't exist yet
        await userRef.set({
            isAdmin: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log('✅ Firestore document updated');

        console.log('\n🚀 Permissions granted successfully!');
        console.log('⚠️  IMPORTANT: You MUST sign out and sign in again in the application to refresh your token.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error granting permissions:', error);
        process.exit(1);
    }
}

const email = process.argv[2];
if (!email) {
    console.error('❌ Error: Please provide an email address');
    console.log('Usage: npx ts-node scripts/make-admin.ts user@example.com');
    process.exit(1);
}

makeAdmin(email);
