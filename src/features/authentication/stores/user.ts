// src/features/authentication/stores/user.ts
import { writable } from 'svelte/store';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import type { Subscriber } from 'svelte/store';

export interface UserAuthStatus {
  isAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAuthChecked: boolean;
  email?: string;
  currentUser: User | null;
}

export const user = writable<UserAuthStatus>({ 
  isAdmin: false,
  isLoading: true,
  isAuthenticated: false,
  isAuthChecked: false,
  currentUser: null
});

export async function verifyAdmin(): Promise<boolean> {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  try {
    // First check local token claims
    if (currentUser) {
      const token = await currentUser.getIdTokenResult();
      if (token.claims.admin) {
        user.update(u => ({ 
          ...u, 
          isAdmin: true,
          isLoading: false,
          isAuthenticated: true,
          isAuthChecked: true,
          email: currentUser.email || undefined,
          currentUser
        }));
        return true;
      }
    }

    // Fallback to Cloud Function
    const verifyAdminFn = httpsCallable<unknown, { isAdmin: boolean }>(
      getFunctions(), 
      'verifyAdmin'
    );
    const { data } = await verifyAdminFn();
    
    user.update(u => ({
      ...u,
      isAdmin: data.isAdmin,
      isLoading: false,
      isAuthenticated: !!currentUser,
      isAuthChecked: true,
      email: currentUser?.email || undefined,
      currentUser
    }));
    
    return data.isAdmin;
  } catch (error) {
    user.update(u => ({
      ...u,
      isAdmin: false,
      isLoading: false,
      isAuthChecked: true
    }));
    return false;
  }
}

export function initAuthListener(): () => void {
  const auth = getAuth();
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      user.update(u => ({
        ...u,
        currentUser: firebaseUser,
        isAuthenticated: true,
        email: firebaseUser.email || undefined
      }));
      await verifyAdmin();
    } else {
      user.set({
        isAdmin: false,
        isLoading: false,
        isAuthenticated: false,
        isAuthChecked: true,
        email: undefined,
        currentUser: null
      });
    }
  });
}