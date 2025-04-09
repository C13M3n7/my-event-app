import { auth } from '$lib/firebase';
import { 
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  GoogleAuthProvider,
  FacebookAuthProvider
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '$lib/firebase';

// Define types at the top of the file
type UserType = 'event' | 'loyalty';
type SocialProvider = 'google' | 'facebook';

interface UserData {
  email?: string;
  phone?: string;
  name?: string;
  [key: string]: unknown; // Allow additional properties
}

export interface UserRecordData extends UserData {
  type: UserType;
  createdAt: Date;
  verified: boolean;
}

// Initialize providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

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
  return await signInWithPhoneNumber(
    auth,
    phoneNumber,
    window.recaptchaVerifier
  );
};

export const verifyPhoneOTP = async (confirmationResult: any, otp: string) => {
  return await confirmationResult.confirm(otp);
};

export const socialRegister = async (provider: SocialProvider) => {
  const selectedProvider = provider === 'google' ? googleProvider : facebookProvider;
  return await signInWithPopup(auth, selectedProvider);
};

export const createUserRecord = async (
  userId: string, 
  userData: UserData,
  userType: UserType
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const recordData: UserRecordData = {
    ...userData,
    type: userType,
    createdAt: new Date(),
    verified: true
  };
  await setDoc(userRef, recordData);
};