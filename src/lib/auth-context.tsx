import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "./supabase";

export type UserTag = "member" | "non-member" | "guest" | "unverified";

export interface User {
  id: string;
  username: string;
  email: string;
  tag: UserTag;
}

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  loading: boolean;
  login: (email: string, password: string, turnstileToken: string) => Promise<void>;
  signup: (username: string, email: string, password: string, turnstileToken: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from members or unverified_users table
  async function fetchUserData(supabaseUserId: string, email: string) {
    // First try members table
    const { data: member } = await supabase
      .from('members')
      .select('id, username, email, tag')
      .eq('id', supabaseUserId)
      .single();

    if (member) {
      setUser({
        id: member.id,
        username: member.username,
        email: member.email,
        tag: member.tag,
      });
      return;
    }

    // Then try unverified_users
    const { data: unverified } = await supabase
      .from('unverified_users')
      .select('id, username, email')
      .eq('email', email)
      .single();

    if (unverified) {
      setUser({
        id: supabaseUserId,
        username: unverified.username,
        email: unverified.email,
        tag: 'unverified',
      });
      return;
    }

    // No record found – should not happen, but clear user
    setUser(null);
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserData(session.user.id, session.user.email!).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserData(session.user.id, session.user.email!);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, _turnstileToken: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const signup = async (username: string, email: string, password: string, _turnstileToken: string) => {
    // Check username uniqueness across members and unverified_users
    const { count: memberCount } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('username', username);
    const { count: unverifiedCount } = await supabase
      .from('unverified_users')
      .select('*', { count: 'exact', head: true })
      .eq('username', username);
    if ((memberCount || 0) + (unverifiedCount || 0) > 0) {
      throw new Error('Username already taken');
    }

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
        data: { username },
      },
    });
    if (error) throw error;

    // Insert into unverified_users table
    if (data.user) {
      const { error: insertError } = await supabase
        .from('unverified_users')
        .insert([{ id: data.user.id, email, username }]);
      if (insertError) console.error('Failed to insert into unverified_users', insertError);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const resendVerification = async () => {
    if (!user?.email) throw new Error('No email found');
    const { error } = await supabase.auth.resend({ type: 'signup', email: user.email });
    if (error) throw error;
  };

  const isGuest = !user && !loading;

  return (
    <AuthContext.Provider value={{ user, isGuest, loading, login, signup, logout, resendVerification }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
