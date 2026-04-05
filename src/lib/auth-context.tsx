import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { supabase } from "./supabase";
import { toast } from "sonner";

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

// Key used to mark that the app is actively signing out (persisted so listener sees it)
const SIGNING_OUT_KEY = "hb_signing_out_v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

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
    isMountedRef.current = true;

    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (isMountedRef.current) {
          if (session?.user) {
            await fetchUserData(session.user.id, session.user.email!);
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth init error:", err);
        if (isMountedRef.current) {
          setUser(null);
          setLoading(false);
        }
      }
    };
    init();

    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      // If we are in the middle of an explicit sign-out (persisted flag), ignore spurious events.
      const signingOut = sessionStorage.getItem(SIGNING_OUT_KEY);
      if (signingOut) {
        console.debug("Auth event ignored during signing out:", event);
        // If the event is SIGNED_OUT, we still want to ensure local state is cleared and loading is false.
        if (event === "SIGNED_OUT") {
          if (isMountedRef.current) {
            setUser(null);
            setLoading(false);
          }
        }
        return;
      }

      if (!isMountedRef.current) return;

      try {
        if (session?.user) {
          await fetchUserData(session.user.id, session.user.email!);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("onAuthStateChange handler error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      isMountedRef.current = false;
      try {
        data?.subscription.unsubscribe();
      } catch (e) {
        // ignore
      }
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
    // Mark signing out so listener ignores intermediate events
    try {
      setLoading(true);
      sessionStorage.setItem(SIGNING_OUT_KEY, "1");

      // 1. Sign out from Supabase and wait
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // 2. Aggressively clear all Supabase-related storage keys from both storages
      try {
        const localKeys = Object.keys(localStorage);
        const sessionKeys = Object.keys(sessionStorage);
        const allKeys = Array.from(new Set([...localKeys, ...sessionKeys]));
        for (const key of allKeys) {
          if (!key) continue;
          if (key.includes("supabase") || key.startsWith("sb-")) {
            try {
              localStorage.removeItem(key);
            } catch (e) {
              // ignore
            }
            try {
              sessionStorage.removeItem(key);
            } catch (e) {
              // ignore
            }
          }
        }
      } catch (e) {
        console.warn("Error while clearing storage keys:", e);
      }

      // 3. Clear React state
      setUser(null);

      // 4. Show success toast
      try {
        toast.success("Successfully logged out!");
      } catch (e) {
        // ignore toast errors
      }

      // 5. Ensure loading flag is cleared before hard reload
      setLoading(false);
      sessionStorage.removeItem(SIGNING_OUT_KEY);

      // 6. Force a full page reload to home (fully reset the app)
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
      // Always clear the signing flag and loading to avoid infinite loading states
      try {
        sessionStorage.removeItem(SIGNING_OUT_KEY);
      } catch {}
      setLoading(false);
      // Rethrow so callers (e.g. Navbar) can show an error toast
      throw err;
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