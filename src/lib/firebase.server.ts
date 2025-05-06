// src/lib/firebase.server.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin only if it hasn't been initialized already
export function initializeFirebase() {
    if (getApps().length === 0) {
        const serviceAccount = JSON.parse(
            process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
        );

        return initializeApp({
            credential: cert(serviceAccount),
            databaseURL: "https://event-management-e606a-default-rtdb.asia-southeast1.firebasedatabase.app"
        });
    }
    return getApps()[0];
}

export const dbAdmin = () => {
    initializeFirebase();
    return getFirestore();
};