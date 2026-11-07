import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuthContext, ADMIN_EMAIL } from '../hooks/useAuth';

const JWT_KEY = 'nickshahbaz_admin_jwt';
const REFRESH_TOKEN_KEY = 'nickshahbaz_admin_refresh_token';
const SESSION_CACHE_KEY = 'nickshahbaz_admin_auth_session';

interface StoredSessionData {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: User;
}

function loadStoredSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSessionData;
    if (parsed && parsed.access_token && parsed.user) {
      return {
        access_token: parsed.access_token,
        refresh_token: parsed.refresh_token,
        expires_at: parsed.expires_at,
        expires_in: parsed.expires_at ? Math.max(0, parsed.expires_at - Math.floor(Date.now() / 1000)) : 3600,
        token_type: 'bearer',
        user: parsed.user,
      };
    }
  } catch (err) {
    console.warn('Failed to parse cached session from localStorage', err);
  }
  return null;
}

function persistSession(session: Session | null) {
  if (typeof window === 'undefined') return;
  try {
    if (session && session.access_token) {
      window.localStorage.setItem(
        SESSION_CACHE_KEY,
        JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
          user: session.user,
        })
      );
      window.localStorage.setItem(JWT_KEY, session.access_token);
      if (session.refresh_token) {
        window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
      }
    } else {
      window.localStorage.removeItem(SESSION_CACHE_KEY);
      window.localStorage.removeItem(JWT_KEY);
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch (err) {
    console.warn('Failed to persist session to localStorage', err);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Eagerly restore session from localStorage so initial render already has user & JWT
  const [cachedSession] = useState<Session | null>(() => loadStoredSession());
  const [session, setSession] = useState<Session | null>(cachedSession);
  const [user, setUser] = useState<User | null>(cachedSession?.user ?? null);
  const [loading, setLoading] = useState<boolean>(() => {
    if (!isSupabaseConfigured) return false;
    // If we have an unexpired cached session, we are ready immediately
    if (cachedSession && cachedSession.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      if (cachedSession.expires_at > now) {
        return false;
      }
    }
    return true;
  });

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isAdmin = Boolean(
    user?.email && (!ADMIN_EMAIL || user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase())
  );

  const updateSessionState = useCallback((newSession: Session | null) => {
    setSession(newSession);
    setUser(newSession?.user ?? null);
    persistSession(newSession);
  }, []);

  const refreshAuthToken = useCallback(async (): Promise<boolean> => {
    try {
      const stored = loadStoredSession();
      const currentRefreshToken = session?.refresh_token || stored?.refresh_token;

      if (!currentRefreshToken) {
        return false;
      }

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: currentRefreshToken,
      });

      if (error || !data.session) {
        console.warn('Token refresh failed:', error?.message);
        return false;
      }

      updateSessionState(data.session);
      return true;
    } catch (err) {
      console.warn('Exception during token refresh:', err);
      return false;
    }
  }, [session, updateSessionState]);

  // Set up background token refresher
  useEffect(() => {
    if (!session?.expires_at) return;

    const now = Math.floor(Date.now() / 1000);
    // Refresh 5 minutes before expiration, or in 15 seconds if already near expiry
    const timeUntilExpiry = session.expires_at - now;
    const refreshDelayMs = Math.max(15, timeUntilExpiry - 300) * 1000;

    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    refreshTimeoutRef.current = setTimeout(() => {
      refreshAuthToken();
    }, refreshDelayMs);

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [session?.expires_at, refreshAuthToken]);

  // Handle initialization and OAuth redirect code exchange
  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    let isMounted = true;

    async function initializeAuth() {
      try {
        // 1. Check for OAuth code in URL (Google redirect back with PKCE code)
        if (typeof window !== 'undefined' && window.location.search.includes('code=')) {
          const params = new URLSearchParams(window.location.search);
          const code = params.get('code');
          if (code) {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (!error && data.session && isMounted) {
              updateSessionState(data.session);
              setLoading(false);
              // Clean query parameter from URL without reloading
              const cleanUrl = window.location.pathname + (window.location.hash || '');
              window.history.replaceState({}, document.title, cleanUrl);
              return;
            }
          }
        }

        // 2. Fetch current session from Supabase
        const { data: { session: activeSession } } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (activeSession) {
          updateSessionState(activeSession);
        } else if (cachedSession?.refresh_token) {
          // If Supabase client has no active session, attempt silent refresh with cached refresh token
          const refreshed = await refreshAuthToken();
          if (!refreshed && isMounted) {
            updateSessionState(null);
          }
        }
      } catch (err) {
        console.warn('Error during auth initialization:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    // 3. Subscribe to onAuthStateChange (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted) return;
      updateSessionState(currentSession);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [cachedSession?.refresh_token, refreshAuthToken, updateSessionState]);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase sign out error:', err);
    }
    updateSessionState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        token: session?.access_token ?? null,
        refreshToken: session?.refresh_token ?? null,
        signInWithGoogle,
        signOut,
        refreshAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
