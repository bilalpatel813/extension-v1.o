"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as api from "./api";
import type { User } from "./api";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  register: (input: { fullName: string; email: string; password: string }) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, "fullName" | "email">>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getCurrentUser().then((u) => {
      setUser(u);
      setIsLoading(false);
    });
  }, []);

  const register: AuthContextValue["register"] = async (input) => {
    const u = await api.registerUser(input);
    setUser(u);
  };

  const login: AuthContextValue["login"] = async (input) => {
    const u = await api.loginUser(input);
    setUser(u);
  };

  const logout = async () => {
    await api.logoutUser();
    setUser(null);
  };

  const updateProfile: AuthContextValue["updateProfile"] = async (updates) => {
    if (!user) return;
    const u = await api.updateProfile(user.id, updates);
    setUser(u);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
