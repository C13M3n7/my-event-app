// src/features/authentication/services/socialAuthService.ts
import { auth } from '$lib/firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider
} from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export const socialSignIn = async (provider: 'google' | 'facebook') => {
  const selectedProvider = provider === 'google' ? googleProvider : facebookProvider;
  const result = await signInWithPopup(auth, selectedProvider);
  return result.user;
};