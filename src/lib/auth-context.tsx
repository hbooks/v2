import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from './supabase';

interface User {
  id: string;
  email: string;
  username: string;
  tag: 'member' | 'non-member' | 'unverified';
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  login: (email: string, password: string, turnstileToken: string) => Promise<void>;
  signup: (username: string, email: string, password: string, turnstileToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const clearAllAuthStorage = () => {
  const allKeys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)];
  allKeys.forEach(key => {
    if (key.includes('supabase') || key.startsWith('sb-') || key.includes('auth-token')) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate that a user exists in our DB and return profile, or null
  const validateAndFetchProfile = useCallback(async (authUser: any): Promise<User | null> => {
    try {
      // Check members table
      const { data: member } = await supabase
        .from('members')
        .select('username, tag')
        .eq('id', authUser.id)
        .single();
      if (member) {
        return {
          id: authUser.id,
          email: authUser.email,
          username: member.username,
          tag: member.tag,
          isAdmin: authUser.email === 'admin@hpbooks.uk',
        };
      }
      // Check unverified_users
      const { data: unverified } = await supabase
        .from('unverified_users')
        .select('username')
        .eq('email', authUser.email)
        .single();
      if (unverified) {
        return {
          id: authUser.id,
          email: authUser.email,
          username: unverified.username,
          tag: 'unverified',
          isAdmin: authUser.email === 'admin@hpbooks.uk',
        };
      }
      // User not found in our DB – return null
      return null;
    } catch (err) {
      console.warn('Profile fetch failed:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setIsLoading(true);
      try {
        // Start with guest
        setUser(null);
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted && session?.user) {
          const profile = await validateAndFetchProfile(session.user);
          if (profile) {
            setUser(profile);
          } else {
            // Invalid session – sign out and clear storage
            await supabase.auth.signOut();
            clearAllAuthStorage();
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
        clearAllAuthStorage();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        setIsLoading(true);
        const profile = await validateAndFetchProfile(session.user);
        if (profile) {
          setUser(profile);
        } else {
          // Signed in with a user not in our DB – force sign out
          await supabase.auth.signOut();
          clearAllAuthStorage();
          setUser(null);
        }
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, [validateAndFetchProfile]);

  const login = useCallback(async (email: string, password: string, turnstileToken: string) => {
    setIsLoading(true);
    try {
      // You need to call your edge function that verifies Turnstile and signs in
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, turnstileToken }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      // The edge function returns session – set it
      await supabase.auth.setSession(data.session);
      // Profile will be fetched by onAuthStateChange
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string, turnstileToken: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, turnstileToken }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      clearAllAuthStorage();
      setUser(null);
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
      clearAllAuthStorage();
      setUser(null);
      window.location.href = '/';
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isGuest = user === null && !isLoading;

  const value = useMemo(() => ({
    user,
    isGuest,
    isLoading,
    login,
    signup,
    logout,
  }), [user, isGuest, isLoading, login, signup, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};