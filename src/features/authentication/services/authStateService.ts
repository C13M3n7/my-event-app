// src/features/authentication/services/authStateService.ts
import { auth, type FirebaseUser } from '$lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const waitForUserAuth = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            unsubscribe();
            resolve(user);
          }
        });
    
        setTimeout(() => {
          unsubscribe();
          reject(new Error('Authentication timeout (phone)'));
        }, 15000); // 15 seconds timeout
      });
};

export const waitForEmailAuth = (email: string, timeout = 60000): Promise<FirebaseUser> => {
  return new Promise((resolve, reject) => {
    // First check current user immediately
    const currentUser = auth.currentUser;
    if (currentUser?.email === email) {
      return resolve(currentUser);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email === email) {
        clearTimeout(timeoutId);
        unsubscribe();
        resolve(user);
      }
    });

    // Increased timeout to 60 seconds
    const timeoutId = setTimeout(() => {
      unsubscribe();
      reject(new Error('Authentication timeout. Please try again.'));
    }, timeout);
  });
};