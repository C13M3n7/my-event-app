import { db } from '$lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { EmailService } from './emailService';
import { httpsCallable } from 'firebase/functions';
import { FirebaseError } from 'firebase/app';
import { functions } from '$lib/firebase'; // Import from your centralized firebase config

const OTP_EXPIRATION_MINUTES = 10;

// In your authService.ts or wherever verifyEmailOTP is defined
interface OtpResponse {
  token?: string; // Optional if you're not using it
  customToken: string; // Add this
  uid: string;
  email: string;
  isAdmin: boolean;
  isNewUser?: boolean;
}

export async function verifyEmailOTP(
  email: string, 
  otp: string, 
  purpose: 'REGISTRATION' | 'LOGIN' | 'ADMIN_LOGIN'
): Promise<OtpResponse> {
  try {
    const verifyOTP = httpsCallable<{
      email: string;
      otp: string;
      purpose: string;
    }, any>(functions, 'verifyOtp');

    const result = await verifyOTP({ 
      email: email.trim().toLowerCase(), 
      otp, 
      purpose 
    });
    
    if (!result.data?.customToken) {
      console.error('Invalid response structure:', result.data);
      throw new Error('Authentication token missing in response');
    }
    
    return {
      uid: result.data.uid,
      email: email,
      customToken: result.data.customToken,
      isAdmin: result.data.isAdmin ?? false,
      isNewUser: result.data.isNewUser ?? false
    };

  } catch (error: any) {
    console.error('Complete OTP Error:', error);
    throw error; // Preserve original error
  }
}

// Update checkAdminStatus to use UID consistently
export const checkAdminStatus = async (uid: string): Promise<boolean> => {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);
  return userDoc.exists() && userDoc.data()?.admin === true; // Keep consistent with your actual field name
};

export const sendEmailOTP = async (email: string, purpose: 'REGISTRATION' | 'LOGIN' | 'ADMIN_LOGIN'): Promise<void> => {
  // For LOGIN/ADMIN_LOGIN, check if user exists
  if (purpose !== 'REGISTRATION') {
      // Query users collection where email field matches
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) throw new Error('No account found with this email');
      
      const userDoc = querySnapshot.docs[0];
      
      // For ADMIN_LOGIN, verify admin status
      if (purpose === 'ADMIN_LOGIN' && !userDoc.data()?.admin) {
          throw new Error('Admin access denied');
      }
  }

  // Rest of the function remains the same...
  const otpRef = doc(db, 'emailOtps', email);
    await deleteDoc(otpRef).catch(() => {});

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

    await setDoc(otpRef, {
        otp,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        verified: false,
        attempts: 0,
        purpose
    });

    await EmailService.sendOTP({ email, otp });
};
