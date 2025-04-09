import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '$lib/firebase';
import emailjs from '@emailjs/browser';

interface OTPData {
  otp: string;
  createdAt: Date;
  expiresAt: Date;
}

  export const sendEmailOTP = async (email: string): Promise<void> => {
    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    await setDoc(doc(db, 'emailOtps', email), {
      otp: generatedOTP,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });
  
    await emailjs.send(
      'service_757016je',
      'template_eyo75gj',
      {
        to_email: email,
        otp_code: generatedOTP
      },
      'z3ZBEDa3WrCGYtGmN'
    );
  
    // Removed: return true;
  };  

export const verifyEmailOTP = async (email: string, enteredOTP: string): Promise<void> => {
  const otpRef = doc(db, 'emailOtps', email);
  const otpDoc = await getDoc(otpRef);
  
  if (!otpDoc.exists()) throw new Error('OTP not found');
  
  const otpData = otpDoc.data();
  if (otpData.otp !== enteredOTP) throw new Error('Invalid OTP');
  if (new Date() > otpData.expiresAt.toDate()) {
    await deleteDoc(otpRef);
    throw new Error('OTP expired');
  }

  await deleteDoc(otpRef);
};