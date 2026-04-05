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
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// Helper to aggressively clear all Supabase-related storage
const clearAllSupabaseStorage = () => {
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

  const fetchUserProfile = useCallback(async (authUser: SupabaseUser) => {
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('Profile fetch timed out')), 5000)
    );

    let profile: { username: string; tag?: string } | null = null;

    try {
      const membersPromise = supabase
        .from('members')
        .select('username, tag')
        .eq('id', authUser.id)
        .single();
      const memberResult = await Promise.race([membersPromise, timeoutPromise]) as any;
      if (memberResult.data) {
        profile = { username: memberResult.data.username, tag: memberResult.data.tag };
      } else {
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
      console.error('Profile fetch error:', err);
    }

    if (profile) {
      setUser({
        id: authUser.id,
        email: authUser.email!,
        username: profile.username,
        tag: profile.tag === 'member' ? 'member' : (profile.tag === 'unverified' ? 'unverified' : 'non-member'),
        isAdmin: authUser.email === 'admin@hpbooks.uk',
      });
    } else {
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
        // First, clear any stale user state
        setUser(null);
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted && session?.user) {
          await fetchUserProfile(session.user);
        } else {
          if (isMounted) setUser(null);
        }
      } catch (err) {
        console.error('Init error:', err);
        if (isMounted) setUser(null);
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

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
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
      // Sign out from Supabase
      await supabase.auth.signOut();
      // Aggressively clear all storage
      clearAllSupabaseStorage();
      // Reset user state
      setUser(null);
      // Force a hard reload to clear React state
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
      clearAllSupabaseStorage();
      setUser(null);
      window.location.href = '/';
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    login,
    signup,
    logout,
  }), [user, isLoading, login, signup, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};