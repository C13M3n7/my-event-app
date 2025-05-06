export type UserType = 'EVENT_REGISTRATION' | 'LOYALTY_PROGRAM';
export type AuthMethod = 'email' | 'phone' | 'google' | 'facebook';
export type TierLevel = 'bronze' | 'silver' | 'gold';

export interface BaseUser {
  id: string;
  type: UserType;  // Keep as UserType for flexibility
  createdAt: Date;
  verified: boolean;
  authMethod: AuthMethod;
  lastLogin?: Date;
}

export interface EventUser extends BaseUser {
  type: 'EVENT_REGISTRATION';  // Narrow to specific type
  email?: string;
  phone?: string;
}

export interface LoyaltyUser extends BaseUser {
  type: 'LOYALTY_PROGRAM';  // Narrow to specific type
  email: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  interests?: string[];
  points: number;
  tier: TierLevel;
}

export type User = EventUser | LoyaltyUser;

export interface OTPData {
  otp: string;
  createdAt: Date;
  expiresAt: Date;
  verified: boolean;
  attempts: number;
  verifiedAt?: Date;
}

export interface OTPEmailParams {
  email: string;
  otp: string;
  expirationMinutes?: number;
  userName?: string;  // Optional personalization
}

// Auth State Types
export interface AuthStoreState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  authMethod?: AuthMethod | null;  // Track current auth method
}

// Error Types
export type AuthError = 
  | 'invalid-credentials'
  | 'otp-expired'
  | 'account-exists'
  | 'invalid-otp'
  | 'account-not-found'
  | 'unauthorized'
  | 'too-many-requests'
  | 'network-error';

// Social Provider Data
export interface SocialProviderData {
  providerId: string;
  uid: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  photoURL?: string;
}