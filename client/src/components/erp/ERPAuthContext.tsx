"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  phone?: string;
  position?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setTokenAndUser: (token: string, user: User) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function ERPAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = Cookies.get("erp_token");
    if (savedToken) {
      setToken(savedToken);
      axios
        .get(`${API}/api/erp/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
        .then((res) => setUser(res.data))
        .catch(() => {
          Cookies.remove("erp_token");
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await axios.post(`${API}/api/erp/auth/login`, { email, password });
    const { access_token, user: u } = res.data;
    Cookies.set("erp_token", access_token, { expires: 7 });
    setToken(access_token);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    Cookies.remove("erp_token");
    setToken(null);
    setUser(null);
  }, []);

  const setTokenAndUser = useCallback((t: string, u: User) => {
    Cookies.set("erp_token", t, { expires: 7 });
    setToken(t);
    setUser(u);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        setTokenAndUser,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useERPAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useERPAuth must be used within ERPAuthProvider");
  return ctx;
}

export function createAuthHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export const apiClient = axios.create({ baseURL: API });
