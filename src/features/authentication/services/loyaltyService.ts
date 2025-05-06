import { doc, setDoc } from 'firebase/firestore';
import { db } from '$lib/firebase';

export const saveLoyaltyProfile = async (email: string, profileData: any) => {
  try {
    const userRef = doc(db, 'users', email);
    
    const profile = {
      ...profileData,
      email: email, // Ensure email is included
      loyaltyMember: true,
      joinedAt: new Date().toISOString(),
      points: 0, // Starting points
      tier: 'silver', // Starting tier
      status: 'active',
      profileComplete: true,
      updatedAt: new Date().toISOString()
    };

    // Single write operation
    await setDoc(userRef, profile, { merge: true });
    
    return profile; // Return the saved profile data
    
  } catch (error) {
    console.error('Error saving loyalty profile:', error);
    throw new Error('Failed to save profile. Please try again.');
  }
};