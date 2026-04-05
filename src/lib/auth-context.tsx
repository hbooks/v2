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

const SIGNUP_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/signup`;
const LOGIN_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/login`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchUserData(userId: string, email: string) {
    try {
      const { data: member } = await supabase
        .from("members")
        .select("id, username, email, tag")
        .eq("id", userId)
        .maybeSingle();
      if (member) {
        setUser({
          id: member.id,
          username: member.username,
          email: member.email,
          tag: member.tag,
        });
        return;
      }
      const { data: unverified } = await supabase
        .from("unverified_users")
        .select("id, username, email")
        .eq("email", email)
        .maybeSingle();
      if (unverified) {
        setUser({
          id: userId,
          username: unverified.username,
          email: unverified.email,
          tag: "unverified",
        });
        return;
      }
      setUser(null);
    } catch (err) {
      console.error("fetchUserData error:", err);
      setUser(null);
    }
  }

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          if (session?.user) {
            await fetchUserData(session.user.id, session.user.email!);
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth init error:", err);
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isMounted) {
        if (session?.user) {
          await fetchUserData(session.user.id, session.user.email!);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, turnstileToken: string) => {
    const response = await fetch(LOGIN_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, turnstileToken }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    setUser({
      id: data.user.id,
      username: data.user.username,
      email: data.user.email,
      tag: data.user.tag,
    });
    await supabase.auth.setSession(data.session);
  };

  const signup = async (username: string, email: string, password: string, turnstileToken: string) => {
    const response = await fetch(SIGNUP_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, turnstileToken }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
  };

  const logout = async () => {
    setLoading(true);
    try {
      // 1. Sign out from Supabase (this invalidates the session on the server)
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // 2. Aggressively clear all Supabase-related storage
      const allKeys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)];
      allKeys.forEach(key => {
        if (key.includes('supabase') || key.startsWith('sb-')) {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        }
      });

      // 3. Clear React state
      setUser(null);

      // 4. Show success message
      alert("Successfully logged out!");

      // 5. Force a full page reload to home (clears any remaining memory state)
      window.location.href = '/';
    } catch (err) {
      console.error("Logout error:", err);
      alert("Logout failed. Please try again.");
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!user?.email) throw new Error("No email found");
    const { error } = await supabase.auth.resend({ type: "signup", email: user.email });
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