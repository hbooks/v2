import { createContext, useContext, useState, ReactNode } from "react";

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
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const isGuest = user === null;

  const login = async (_email: string, _password: string) => {
    // TODO: Replace with Supabase Auth signInWithPassword
    // For now, mock login
    setUser({
      id: "mock-id",
      username: "reader",
      email: _email,
      tag: "non-member",
    });
  };

  const signup = async (_username: string, _email: string, _password: string) => {
    // TODO: Replace with Supabase Auth signUp + insert into unverified_users
    setUser({
      id: "mock-id",
      username: _username,
      email: _email,
      tag: "unverified",
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isGuest, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
