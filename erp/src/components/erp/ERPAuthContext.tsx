"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "hr" | "manager";
  team?: string;
  teams?: string[];
  team_role?: string;
  sprint?: string;
  phone?: string;
  position?: string;
  avatar?: string;
  org_id?: string;
  org_name?: string;
  permissions?: string[];
}

interface ERPAuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, org_id?: string) => Promise<any>;
  signup: (orgName: string, adminName: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  setTokenAndUser: (token: string, user: User) => void;
  switchOrganization: (orgId: string) => Promise<void>;
  isAdmin: boolean;
  isLeader: boolean;
  hasPermission: (perm: string) => boolean;
  API: string;
}

const ERPAuthContext = createContext<ERPAuthContextType | null>(null);

export function ERPAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const setTokenAndUser = useCallback((t: string, u: User) => {
    Cookies.set("erp_token", t, { expires: 7 });
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    Cookies.remove("erp_token");
    setToken(null);
    setUser(null);
  }, []);

  const switchOrganization = useCallback(async (orgId: string) => {
    if (!token) return;
    try {
      const res = await axios.post(`${API}/api/erp/auth/switch/${orgId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { access_token, user: userData } = res.data;
      setTokenAndUser(access_token, userData);
    } catch (err) {
      console.error("Switch organization error:", err);
      throw err;
    }
  }, [token, setTokenAndUser]);

  const login = useCallback(async (email: string, password: string, org_id?: string) => {
    const res = await axios.post(`${API}/api/erp/auth/login`, { email, password, org_id });
    if (res.data.multi_org) {
      return res.data; // { multi_org: true, accounts: [...] }
    }
    const { access_token, user: u } = res.data;
    setTokenAndUser(access_token, u);
    return res.data;
  }, [setTokenAndUser]);

  const signup = useCallback(async (orgName: string, adminName: string, email: string, password: string, phone?: string) => {
    try {
      const res = await axios.post(`${API}/api/erp/auth/signup`, { org_name: orgName, admin_name: adminName, email, password, phone });
      const { access_token, user: userData = res.data.user || res.data } = res.data;
      setTokenAndUser(access_token, userData as User);
    } catch (err) {
      console.error("Signup error:", err);
      throw err;
    }
  }, [setTokenAndUser]);

  useEffect(() => {
    const handleInit = async () => {
      // 1. Check URL for token (priority)
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get("token");
      
      let effectiveToken = urlToken || Cookies.get("erp_token");

      if (urlToken) {
        // Clear URL params without reloading to keep it clean
        const url = new URL(window.location.href);
        url.searchParams.delete("token");
        window.history.replaceState({}, "", url.toString());
      }

      if (effectiveToken) {
        setLoading(true);
        try {
          const res = await axios.get(`${API}/api/erp/auth/me`, {
            headers: { Authorization: `Bearer ${effectiveToken}` },
          });
          setTokenAndUser(effectiveToken, res.data);
        } catch (err) {
          console.error("Auth init error:", err);
          if (!urlToken) { // Only clear if it was from cookie
            Cookies.remove("erp_token");
            setToken(null);
            setUser(null);
          }
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    handleInit();
  }, [setTokenAndUser]);

  const isAdmin = user?.role === "admin";
  const isLeader = isAdmin || ["hr", "manager"].includes(user?.role || "") || user?.team_role === "Team Leader";

  return (
    <ERPAuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        setTokenAndUser,
        switchOrganization,
        isAdmin,
        isLeader,
        hasPermission: (perm: string) => {
          if (user?.role === "admin") return true;
          return user?.permissions?.includes(perm) || false;
        },
        API,
      }}
    >
      {children}
    </ERPAuthContext.Provider>
  );
}

export function useERPAuth() {
  const ctx = useContext(ERPAuthContext);
  if (!ctx) throw new Error("useERPAuth must be used within ERPAuthProvider");
  return ctx;
}

export function createAuthHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export const apiClient = axios.create({ baseURL: API });
