"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserIdentity } from "@/types/auth";
import { authApi } from "@/lib/api/auth";

interface AuthContextType {
  user: UserIdentity | null;
  loading: boolean;
  login: (token: string, user: UserIdentity) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserIdentity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("nexus_user");
        const storedToken = localStorage.getItem("nexus_token");
        if (storedToken && storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            localStorage.removeItem("nexus_user");
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (token: string, userData: UserIdentity) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nexus_token", token);
      localStorage.setItem("nexus_user", JSON.stringify(userData));
      document.cookie = `nexus_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax`;
    }
    setUser(userData);
  };

  const logout = () => {
    authApi.logout();
    if (typeof window !== "undefined") {
      document.cookie = "nexus_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
