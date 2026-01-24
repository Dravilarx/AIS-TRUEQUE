#!/usr/bin/env node

/**
 * Script to set admin role for a user in Firebase
 * 
 * Usage:
 *   node set-admin.js <email> [true|false]
 * 
 * Example:
 *   node set-admin.js admin@school.com true
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.resolve(__dirname, '../firebase-service-account.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

async function setAdminRole(email, isAdmin = true) {
    try {
        // Get user by email
        const user = await admin.auth().getUserByEmail(email);

        console.log(`Found user: ${user.email} (UID: ${user.uid})`);

        // Set custom claims
        await admin.auth().setCustomUserClaims(user.uid, { admin: isAdmin });

        console.log(`✅ Successfully set admin=${isAdmin} for ${email}`);
        console.log('\nNote: The user will need to sign out and sign in again for the changes to take effect.');

        // Also update Firestore if the users collection exists
        try {
            const userRef = admin.firestore().collection('users').doc(user.uid);
            await userRef.update({
                isAdmin,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Updated Firestore user document');
        } catch (firestoreError) {
            console.log('ℹ️  Firestore update skipped (user document may not exist yet)');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting admin role:', error.message);
        process.exit(1);
    }
}

// Parse command line arguments
const email = process.argv[2];
const isAdminArg = process.argv[3];

if (!email) {
    console.error('❌ Error: Email address required');
    console.log('\nUsage:');
    console.log('  node set-admin.js <email> [true|false]');
    console.log('\nExample:');
    console.log('  node set-admin.js admin@school.com true');
    process.exit(1);
}

const isAdmin = isAdminArg !== 'false'; // Default to true unless explicitly set to false

console.log(`Setting admin role for: ${email}`);
console.log(`Admin status: ${isAdmin}\n`);

setAdminRole(email, isAdmin);
