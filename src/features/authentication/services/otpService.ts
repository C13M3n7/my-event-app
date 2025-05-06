import { runTransaction, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '$lib/firebase';
import { waitForEmailAuth } from './authStateService';
import { EmailService } from './emailService';
import type { User as FirebaseUser } from 'firebase/auth';

// Constants
const OTP_EXPIRATION_MINUTES = 30;

export const sendEmailOTP = async (email: string, purpose?: string): Promise<void> => {
  const otpRef = doc(db, 'emailOtps', email);

  try {
    await deleteDoc(otpRef);
  } catch (error) {
    console.log('No existing OTP to clear');
  }

  const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

  console.log(`[OTP Creation] Generated OTP for ${email} at ${new Date().toISOString()}. Expires at: ${expiresAt.toISOString()}`);

  await setDoc(otpRef, {
    otp: generatedOTP,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    verified: false,
    attempts: 0,
    purpose: purpose || 'general' // Store the purpose with the OTP
  });

  try {
    console.log(`[OTP Sent] Sending OTP to ${email} at ${new Date().toISOString()}`);
    await EmailService.sendOTP({ email, otp: generatedOTP });
    console.log(`[OTP Sent] OTP sent to ${email} successfully at ${new Date().toISOString()}`);
  } catch (error) {
    console.error("Failed to send OTP email:", error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

export const verifyEmailOTP = async (email: string, otp: string, purpose?: string): Promise<void> => {
  console.log(`[OTP Verification] Verifying OTP for ${email}`);

  await runTransaction(db, async (transaction) => {
    const otpRef = doc(db, 'emailOtps', email);
    const otpDoc = await transaction.get(otpRef);

    if (!otpDoc.exists()) {
      throw new Error('OTP not found. Please request a new one.');
    }

    const otpData = otpDoc.data();
    const expiresAt = new Date(otpData.expiresAt);

    if (new Date().getTime() > expiresAt.getTime()) {
      transaction.delete(otpRef);
      throw new Error('OTP expired. Please request a new code.');
    }

    if (otpData.verified) {
      transaction.delete(otpRef);
      throw new Error('This OTP was already used.');
    }

    if (otpData.otp !== otp) {
      transaction.update(otpRef, { attempts: (otpData.attempts || 0) + 1 });
      throw new Error('Invalid OTP code');
    }

    if (purpose && otpData.purpose !== purpose) {
      throw new Error('This OTP is not valid for the current action');
    }

    // Add user creation for event registration
    if (purpose === 'EVENT_REGISTRATION') {
      const userRef = doc(db, 'users', email);
      const userData = {
        email,
        type: 'EVENT_REGISTRATION',
        createdAt: new Date().toISOString(),
        verified: true,
        authMethod: 'email'
      };
      transaction.set(userRef, userData, { merge: true });
    }

    transaction.update(otpRef, {
      verified: true,
      verifiedAt: new Date().toISOString()
    });
  });
};