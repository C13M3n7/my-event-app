import { writable } from 'svelte/store';
import type { AuthStoreState, User } from '../types/auth.types';

const initialState: AuthStoreState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

export const authStore = writable<AuthStoreState>(initialState);

export const setUser = (user: User | null) => {
  authStore.update(state => ({
    ...state,
    user,
    isAuthenticated: !!user,
    loading: false,
    error: null
  }));
};

export const setLoading = (loading: boolean) => {
  authStore.update(state => ({ ...state, loading }));
};

export const setError = (error: string | null) => {
  authStore.update(state => ({ ...state, error }));
};

export const logout = () => {
  authStore.set(initialState);
};