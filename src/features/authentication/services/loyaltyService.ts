import { doc, setDoc } from 'firebase/firestore';
import { db } from '$lib/firebase';

export const saveLoyaltyProfile = async (email: string, profileData: any) => {
  try {
    const userRef = doc(db, 'users', email);
    
    const profile = {
      // Profile fields
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      birthDate: profileData.birthDate,
      interests: profileData.interests,
      race: profileData.race,
      
      // Loyalty program fields
      loyaltyMember: true,
      joinedAt: new Date().toISOString(),
      points: 0,
      tier: 'silver',
      status: 'active',
      
      // System fields
      profileComplete: true,
      updatedAt: new Date().toISOString(),
      
      // Required fields for security rules
      email: email.toLowerCase(), // Ensure consistent casing
      type: 'LOYALTY_PROGRAM',
      authMethod: profileData.authMethod || 'EMAIL', // Must match security rules
      createdAt: profileData.createdAt || new Date().toISOString()
    };

    await setDoc(userRef, profile, { merge: true });
    return profile;
  } catch (error) {
    console.error('Error saving loyalty profile:', error);
    throw new Error('Failed to save profile. Please try again.');
  }
};