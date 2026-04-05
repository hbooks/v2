// src/lib/auth-context.tsx
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from './supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  username: string;
  tag: 'member' | 'non-member' | 'unverified';
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  checkIdentifier: (identifier: string) => Promise<{ found: boolean; email: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // start true

  // Fetch user profile from members or unverified_users
  const fetchUserProfile = useCallback(async (authUser: SupabaseUser) => {
    // Timeout after 5 seconds
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('Profile fetch timed out')), 5000)
    );

    // First try members table
    const membersPromise = supabase
      .from('members')
      .select('username, tag')
      .eq('id', authUser.id)
      .single();

    let profile = null;
    let error = null;
    try {
      const result = await Promise.race([membersPromise, timeoutPromise]) as any;
      if (result.data) {
        profile = result.data;
      } else {
        // Try unverified_users
        const unverifiedPromise = supabase
          .from('unverified_users')
          .select('username')
          .eq('email', authUser.email!)
          .single();
        const unverifiedResult = await Promise.race([unverifiedPromise, timeoutPromise]) as any;
        if (unverifiedResult.data) {
          profile = { username: unverifiedResult.data.username, tag: 'unverified' };
        }
      }
    } catch (err) {
      console.error('Profile fetch error or timeout:', err);
    }

    if (profile) {
      setUser({
        id: authUser.id,
        email: authUser.email!,
        username: profile.username,
        tag: profile.tag === 'unverified' ? 'unverified' : (profile.tag === 'member' ? 'member' : 'non-member'),
        isAdmin: authUser.email === 'admin@hpbooks.uk',
      });
    } else {
      // Fallback – create minimal user from auth metadata
      const username = authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'user';
      setUser({
        id: authUser.id,
        email: authUser.email!,
        username,
        tag: 'non-member',
        isAdmin: authUser.email === 'admin@hpbooks.uk',
      });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted && session?.user) {
          await fetchUserProfile(session.user);
        }
      } catch (err) {
        console.error('Init error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        setIsLoading(true);
        await fetchUserProfile(session.user);
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
  }, [fetchUserProfile]);

  const checkIdentifier = useCallback(async (identifier: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-identifier`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier }),
        }
      );
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // The onAuthStateChange will handle setting the user
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // First check username uniqueness via your edge function or direct query
      const { data: existingMember } = await supabase
        .from('members')
        .select('username')
        .eq('username', username)
        .maybeSingle();
      const { data: existingUnverified } = await supabase
        .from('unverified_users')
        .select('username')
        .eq('username', username)
        .maybeSingle();
      if (existingMember || existingUnverified) {
        throw new Error('Username already taken');
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });
      if (error) throw error;

      // After signup, insert into unverified_users (you may do this in an edge function)
      // For simplicity, we do it here, but consider moving to edge function.
      const { data: { user: newUser } } = await supabase.auth.getUser();
      if (newUser) {
        await supabase.from('unverified_users').insert([{ id: newUser.id, email, username }]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Clear all Supabase storage to be safe
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('supabase') || key.startsWith('sb-')) localStorage.removeItem(key);
      });
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach(key => {
        if (key.includes('supabase') || key.startsWith('sb-')) sessionStorage.removeItem(key);
      });
      setUser(null);
      // Force hard reload to clear any lingering state
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    login,
    signup,
    checkIdentifier,
    logout,
  }), [user, isLoading, login, signup, checkIdentifier, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};