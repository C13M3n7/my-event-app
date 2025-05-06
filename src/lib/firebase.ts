// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { 
  getAuth,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  RecaptchaVerifier,
  type User as FirebaseUser
} from "firebase/auth";
import { getFirestore, collection, addDoc, updateDoc, doc, getDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyCfhVIqVzN9cnW9T3JMxfFHkSjsWRSuSgY",
  authDomain: "event-management-e606a.firebaseapp.com",
  databaseURL: "https://event-management-e606a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "event-management-e606a",
  storageBucket: "event-management-e606a.firebasestorage.app",
  messagingSenderId: "324828200275",
  appId: "1:324828200275:web:ba46183ffde6a4c8ff35a6",
  measurementId: "G-F313Y6B53S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// Auth Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Initialize reCAPTCHA
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

const initRecaptcha = (containerId = 'recaptcha-container') => {
  if (typeof window !== 'undefined') {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
    });
  }
};

// Auth Methods
const logout = () => signOut(auth);

const phoneSignIn = async (phoneNumber: string) => {
  if (!window.recaptchaVerifier) {
    throw new Error('Recaptcha verifier not initialized');
  }
  return signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
};

const socialSignIn = async (provider: 'google' | 'facebook') => {
  const selectedProvider = provider === 'google' ? googleProvider : facebookProvider;
  const result = await signInWithPopup(auth, selectedProvider);
  return result.user;
};

// Export all
export { 
  app,
  auth,
  db,
  functions,
  logout,
  phoneSignIn,
  socialSignIn,
  initRecaptcha,
  googleProvider,
  facebookProvider,
  type FirebaseUser,
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  deleteDoc,
  getDocs
};