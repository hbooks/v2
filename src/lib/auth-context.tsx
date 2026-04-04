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

// Your edge function URL (already deployed)
const SIGNUP_FUNCTION_URL = "https://ucqekjqqdullzrzyeodl.supabase.co/functions/v1/signup";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Core function to fetch user data and auto‑move if verified
  async function fetchUserData(supabaseUserId: string, email: string) {
    // 1. Check members table first
    const { data: member } = await supabase
      .from("members")
      .select("id, username, email, tag")
      .eq("id", supabaseUserId)
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

    // 2. Check unverified_users
    const { data: unverified } = await supabase
      .from("unverified_users")
      .select("id, username, email")
      .eq("email", email)
      .single();

    if (unverified) {
      // Check if email is confirmed in Supabase Auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.email_confirmed_at) {
        // Email confirmed → move to members
        const { error: insertError } = await supabase
          .from("members")
          .insert({
            id: supabaseUserId,
            email,
            username: unverified.username,
            tag: "non-member",
          });
        if (!insertError) {
          // Delete from unverified_users
          await supabase.from("unverified_users").delete().eq("email", email);
          // Re‑fetch as member (recursive call, but will hit the members branch)
          await fetchUserData(supabaseUserId, email);
          return;
        }
      } else {
        // Still unverified
        setUser({
          id: supabaseUserId,
          username: unverified.username,
          email,
          tag: "unverified",
        });
        return;
      }
    }

    // No record found – should not happen for logged‑in users, but clear state
    setUser(null);
  }

  // Initialize session and listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserData(session.user.id, session.user.email!).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

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

  // Login – uses standard Supabase Auth
  const login = async (email: string, password: string, _turnstileToken: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    // The onAuthStateChange will trigger fetchUserData, which auto‑moves if verified
  };

  // Signup – calls your edge function (already does validation + Turnstile)
  const signup = async (username: string, email: string, password: string, turnstileToken: string) => {
    const response = await fetch(SIGNUP_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, turnstileToken }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    // Success – user must verify email before logging in
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const resendVerification = async () => {
    if (!user?.email) throw new Error("No email found");
    const { error } = await supabase.auth.resend({ type: "signup", email: user.email });
    if (error) throw error;
  };

  const isGuest = !user && !loading;

  return (
    <AuthContext.Provider
      value={{ user, isGuest, loading, login, signup, logout, resendVerification }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}