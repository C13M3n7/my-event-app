import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPhoneNumber, 
  signInWithPopup, 
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  RecaptchaVerifier,
  createUserWithEmailAndPassword, 
  updateProfile,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import type { User } from "firebase/auth";
import emailjs from '@emailjs/browser';

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

const logout = () => signOut(auth);

export { 
  auth,
  db,
  logout,
  signInWithPhoneNumber, 
  signInWithPopup, 
  RecaptchaVerifier,
  googleProvider, 
  facebookProvider 
};

// Types for function parameters
type UserType = 'event' | 'loyalty';
interface UserDetails {
  fullName: string;
  phone: string;
}

export const register = async (
  email: string, 
  password: string, 
  userType: UserType, 
  userDetails: UserDetails
): Promise<User> => {
  try {
    // Create the user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile (only displayName, photoURL allowed by Firebase)
    await updateProfile(user, {
      displayName: userDetails.fullName,
      // Note: Firebase does not support phoneNumber directly in updateProfile
      // You will need to store phone number elsewhere, e.g., in Firestore
    });

    // Optional: Store additional user info like userType in Firestore or Realtime Database
    // Example: Saving userType in Firestore
    // const db = getFirestore();
    // await setDoc(doc(db, 'users', user.uid), { userType });

    return user;
  } catch (error) {
    throw new Error('Registration failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

emailjs.init('z3ZBEDa3WrCGYtGmN');
export { emailjs };