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
  resendVerification: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// Helper to clear all storage
const clearStorage = () => {
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

  // Call the auth-status edge function to get the current user from the token
  const fetchUserFromToken = useCallback(async (token: string): Promise<User | null> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      return data.user;
    } catch (err) {
      console.error('fetchUserFromToken error:', err);
      return null;
    }
  }, []);

  // On app load, try to get session from Supabase and validate
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setIsLoading(true);
      try {
        // Get session from Supabase (this is still needed to get the token)
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const userData = await fetchUserFromToken(session.access_token);
          if (userData && isMounted) setUser(userData);
          else {
            // Invalid session – clear storage
            clearStorage();
            await supabase.auth.signOut();
            if (isMounted) setUser(null);
          }
        } else {
          if (isMounted) setUser(null);
        }
      } catch (err) {
        console.error('Init error:', err);
        clearStorage();
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    init();
  }, [fetchUserFromToken]);

  // Resend verification email
   const resendVerification = useCallback(async () => {
    if (!user?.email) throw new Error("No email found");
    const { error } = await supabase.auth.resend({ type: "signup", email: user.email });
    if (error) throw error;
  }, [user]);

  const login = useCallback(async (email: string, password: string, turnstileToken: string) => {
    setIsLoading(true);
    try {
      // Call your existing login edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, turnstileToken }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      // Set the session in Supabase (this stores the token in localStorage)
      await supabase.auth.setSession(data.session);
      // Now fetch the user using the token
      const userData = await fetchUserFromToken(data.session.access_token);
      setUser(userData);
    } catch (err: any) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserFromToken]);

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
      clearStorage();
      setUser(null);
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
      clearStorage();
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
    resendVerification,
  }), [user, isGuest, isLoading, login, signup, logout, resendVerification]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};