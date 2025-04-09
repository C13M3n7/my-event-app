import { db, auth } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { 
  signInWithPhoneNumber,
  sendSignInLinkToEmail,
  RecaptchaVerifier,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth';

interface RegistrationData {
  email?: string;
  phone?: string;
  type: 'event' | 'loyalty';
  createdAt: Date;
  verified: boolean;
}

export const registerUser = async (data: RegistrationData, recaptchaVerifier?: RecaptchaVerifier) => {
  const identifier = data.email || data.phone;
  if (!identifier) throw new Error('Email or phone required');
  
  // Verify contact method first
  if (data.phone && recaptchaVerifier) {
    const confirmation = await signInWithPhoneNumber(
      auth,
      data.phone,
      recaptchaVerifier
    );
    return { 
      registrationId: identifier,
      confirmation // For OTP verification
    };
  } else if (data.email) {
    await sendSignInLinkToEmail(auth, data.email, {
      url: `${window.location.origin}/verify-email?type=${data.type}`,
      handleCodeInApp: true,
    });
    localStorage.setItem('emailForSignIn', data.email);
    return { registrationId: identifier };
  }
  
  throw new Error('Verification method not supported');
};

export const completeRegistration = async (identifier: string, type: 'event' | 'loyalty') => {
    const registrationRef = doc(db, 'registrations', identifier);
    
    // If it's an email, store it under the 'email' field, otherwise under 'phone'.
    const field = identifier.includes('@') ? 'email' : 'phone';
    
    await setDoc(registrationRef, {
      [field]: identifier,
      type,
      createdAt: new Date(),
      verified: true
    });
  };
  