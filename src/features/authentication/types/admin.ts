// src/features/authentication/types/admin.ts
import type { User } from 'firebase/auth';

export interface UserAuthStatus {
  isAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAuthChecked: boolean;
  email?: string;
  currentUser: User | null;
}

export interface VerifyAdminResponse {
  isAdmin: boolean;
}

export interface AdminUser {
  uid: string;
  email?: string | null;
  customClaims?: {
    admin?: boolean;
    level?: string;
  };
}

export interface AdminResponse {
  success: boolean;
  message: string;
  uid?: string;
}