/**
 * Store Zustand pour la gestion de l'authentification.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthTokens } from '../types/user';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTokens: (tokens) => set({ tokens }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      login: (user, tokens) => set({
        user,
        tokens,
        isAuthenticated: true,
        error: null,
      }),
      
      logout: () => set({
        user: null,
        tokens: null,
        isAuthenticated: false,
        error: null,
      }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
