"use client";
import React, { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ERPAuthProvider, useERPAuth } from "@/src/components/erp/ERPAuthContext";
import "@/src/components/erp/erp.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function LoginForm() {
  const { login, setTokenAndUser } = useERPAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectionToken, setSelectionToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sToken = params.get("selection_token");
    const err = params.get("error");
    
    if (sToken) {
      setSelectionToken(sToken);
      fetchAccounts(sToken);
    }
    if (err === "not_registered") {
      setError("This Google account is not registered. Please sign up or contact your administrator.");
    } else if (err === "auth_failed") {
      setError("Authentication failed. Please try again.");
    }
  }, []);

  const fetchAccounts = async (token: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/erp/auth/accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccounts(res.data);
    } catch (err: any) {
      setError("Session expired. Please try logging in again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent, org_id?: string) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (selectionToken && org_id) {
        const res = await axios.post(`${API}/api/erp/auth/switch/${org_id}`, {}, {
          headers: { Authorization: `Bearer ${selectionToken}` }
        });
        const { access_token, user: u } = res.data;
        setTokenAndUser(access_token, u);
        router.push("/erp/dashboard");
        return;
      }

      const res = await login(email, password, org_id);
      if (res && res.multi_org) {
        setAccounts(res.accounts);
      } else {
        router.push("/erp/dashboard");
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${API}/api/erp/auth/google`;
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #05050e 0%, #0f0518 50%, #05050e 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', 'Outfit', sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(167,139,250,0.18)",
          borderRadius: "24px",
          padding: "40px 36px",
          backdropFilter: "blur(20px)",
        }}
      >
        <Link href="/erp" style={{ color: "#666", textDecoration: "none", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px", marginBottom: "28px" }}>
          ← Back
        </Link>

        {accounts.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 10px", color: "#fff", textAlign: "center" }}>Select Organization</h2>
            <p style={{ color: "#888", fontSize: "13px", textAlign: "center", marginBottom: "16px" }}>You are part of multiple workspaces</p>
            {accounts.map(acc => (
              <div 
                key={acc.org_id} 
                onClick={() => handleSubmit(undefined, acc.org_id)}
                style={{
                  padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.2s"
                }}
                onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
              >
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{acc.org_name[0]}</div>
                <div style={{ flex: 1, fontWeight: 600, color: "#fff" }}>{acc.org_name}</div>
                <div style={{ color: "#666", fontSize: "12px" }}>Select →</div>
              </div>
            ))}
            <button 
              className="erp-btn erp-btn-ghost" 
              style={{ marginTop: "12px" }}
              onClick={() => { setAccounts([]); setPassword(""); setSelectionToken(null); }}
            >
              Sign in with another account
            </button>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "16px",
                background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "24px", fontWeight: 800, color: "#fff", margin: "0 auto 16px",
              }}>E</div>
              <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 6px", color: "#fff" }}>Welcome back</h1>
              <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>Sign in to Team ERP</p>
            </div>

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "10px", padding: "12px 14px", marginBottom: "20px",
                color: "#f87171", fontSize: "14px",
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="erp-label">Email</label>
                <input
                  className="erp-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label className="erp-label" style={{ marginBottom: 0 }}>Password</label>
                  <Link href="/erp/forgot-password" style={{ fontSize: "12px", color: "#a78bfa", textDecoration: "none", fontWeight: 600 }}>Forgot password?</Link>
                </div>
                <input
                  className="erp-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="erp-btn erp-btn-primary"
                disabled={loading}
                style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: "15px", marginTop: "4px", opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
              <span style={{ color: "#555", fontSize: "13px" }}>or</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
            </div>

            <button
              onClick={handleGoogle}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                transition: "all 0.2s",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a11.986 11.986 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
              Continue with Google
            </button>

            <p style={{ textAlign: "center", color: "#666", fontSize: "13px", marginTop: "24px" }}>
              Don't have an organization?{" "}
              <Link href="/erp/signup" style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 600 }}>Create one</Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}

export default function ERPLoginPage() {
  return (
    <ERPAuthProvider>
      <LoginForm />
    </ERPAuthProvider>
  );
}
