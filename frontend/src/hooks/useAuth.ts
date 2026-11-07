import { createContext, useContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';

// The designated administrator email address authorized to manage the CMS, loaded from env or default
export const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'nickshahbaz135@gmail.com').toLowerCase();

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  token?: string | null;
  refreshToken?: string | null;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithEmail?: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshAuthToken?: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
