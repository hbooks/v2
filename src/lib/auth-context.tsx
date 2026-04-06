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

// Aggressively clear all Supabase storage
const nukeSupabaseStorage = () => {
  const keys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)];
  keys.forEach(key => {
    if (key.includes('supabase') || key.includes('sb-') || key.includes('auth-token')) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate user against database – returns null if not found
  const validateUser = useCallback(async (authUser: any): Promise<User | null> => {
    try {
      // Check members table using maybeSingle() (no error if not found)
      const { data: member } = await supabase
        .from('members')
        .select('username, tag')
        .eq('id', authUser.id)
        .maybeSingle();
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
        .maybeSingle();
      if (unverified) {
        return {
          id: authUser.id,
          email: authUser.email,
          username: unverified.username,
          tag: 'unverified',
          isAdmin: authUser.email === 'admin@hpbooks.uk',
        };
      }
      return null;
    } catch (err) {
      console.warn('Validation error:', err);
      return null;
    }
  }, []);

  // Force logout and clear everything
  const forceLogout = useCallback(async () => {
    nukeSupabaseStorage();
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  }, []);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setIsLoading(true);
      try {
        setUser(null); // start as guest
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const validUser = await validateUser(session.user);
          if (validUser) {
            if (isMounted) setUser(validUser);
          } else {
            // Invalid session – nuke it
            console.warn('Stale session detected, clearing...');
            await forceLogout();
            return;
          }
        }
      } catch (err) {
        console.error('Init error:', err);
        nukeSupabaseStorage();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        setIsLoading(true);
        const validUser = await validateUser(session.user);
        if (validUser) {
          setUser(validUser);
        } else {
          // Signed in with a user not in DB – force logout
          await forceLogout();
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
  }, [validateUser, forceLogout]);

  const login = useCallback(async (email: string, password: string, turnstileToken: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, turnstileToken }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await supabase.auth.setSession(data.session);
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
      nukeSupabaseStorage();
      setUser(null);
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
      nukeSupabaseStorage();
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