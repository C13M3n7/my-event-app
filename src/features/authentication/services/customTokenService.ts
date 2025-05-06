import { getFunctions, httpsCallable } from 'firebase/functions';
import { signInWithCustomToken } from 'firebase/auth';
import { auth, type FirebaseUser } from '$lib/firebase'; // Adjust this path to your firebase initialization file

export async function completeEmailSignIn(email: string): Promise<FirebaseUser> {
  const functions = getFunctions();
  const generateToken = httpsCallable(functions, 'completeEmailSignIn');

  try {
    const result: any = await generateToken({ email });
    const token = result.data.token;
    
    // Sign in with the custom token
    const userCredential = await signInWithCustomToken(auth, token);
    
    // Return the authenticated user
    return userCredential.user;
  } catch (err) {
    console.error('Custom token sign-in error:', err);
    throw new Error('Failed to complete sign-in. Please try again.');
  }
}