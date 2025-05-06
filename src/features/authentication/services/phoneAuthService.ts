// src/features/authentication/services/phoneAuthService.ts
import { auth } from '$lib/firebase';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

export const initializeRecaptcha = (containerId = 'recaptcha-container'): void => {
  if (typeof window !== 'undefined') {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
    });
  }
};

export const sendPhoneVerification = async (phoneNumber: string) => {
  if (!window.recaptchaVerifier) {
    throw new Error('Recaptcha verifier not initialized');
  }

  return await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
};

export const verifyPhoneOTP = async (confirmationResult: any, otp: string) => {
  const result = await confirmationResult.confirm(otp);
  return result.user;
};
