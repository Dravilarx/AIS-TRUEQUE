import * as admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

const serviceAccountPath = resolve('./firebase-service-account.json');

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
});

const auth = admin.auth();

async function listUsers() {
    try {
        const listUsersResult = await auth.listUsers(10);
        listUsersResult.users.forEach((userRecord) => {
            console.log(`User: ${userRecord.email} - UID: ${userRecord.uid}`);
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
listUsers();
