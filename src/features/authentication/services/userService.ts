// src/features/authentication/services/userService.ts
// Handles Firestore logic (create, update, fetch users)
import { db } from '$lib/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import type {
  User,
  LoyaltyUser,
  EventUser,
  UserType,
  AuthMethod,
  BaseUser
} from '../types/auth.types';
import type { User as FirebaseUser } from 'firebase/auth';

export const createUserRecord = async (
  firebaseUser: FirebaseUser,
  userData: Partial<LoyaltyUser> & { email?: string; phone?: string },
  userType: UserType
): Promise<User> => {
  const userRef = doc(db, 'users', firebaseUser.uid);
  
  const baseData: BaseUser = {
    id: firebaseUser.uid,
    type: userType,
    createdAt: new Date(),
    verified: true,
    authMethod: userData.email ? 'email' : 'phone',
    lastLogin: new Date()
  };

  if (userType === 'LOYALTY_PROGRAM') {
    const loyaltyUser: LoyaltyUser = {
      ...baseData,
      type: 'LOYALTY_PROGRAM', // Explicit type
      email: userData.email || '',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      birthDate: userData.birthDate,
      interests: userData.interests || [],
      points: userData.points ?? 100,
      tier: userData.tier ?? 'silver'
    };
    await setDoc(userRef, loyaltyUser);
    return loyaltyUser;
  } else {
    const eventUser: EventUser = {
      ...baseData,
      type: 'EVENT_REGISTRATION', // Explicit type
      email: userData.email,
      phone: userData.phone
    };
    await setDoc(userRef, eventUser);
    return eventUser;
  }
};

export const convertToLoyalty = async (
  userId: string,
  userData: {
    firstName: string;
    lastName: string;
    birthDate?: string;
    interests?: string[];
  }
): Promise<LoyaltyUser> => {
    const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);
  
  if (!docSnap.exists()) {
    throw new Error('User not found');
  }

  const currentData = docSnap.data() as User;
  
  if (!currentData.email) {
    throw new Error('Email is required for loyalty conversion');
  }

  const updates: Partial<LoyaltyUser> = {
    type: 'LOYALTY_PROGRAM',
    firstName: userData.firstName,
    lastName: userData.lastName,
    birthDate: userData.birthDate,
    interests: userData.interests || [],
    points: 100,
    tier: 'silver'
  };

  await updateDoc(userRef, updates);

  return {
    ...currentData,
    ...updates,
    email: currentData.email
  } as LoyaltyUser;
};
