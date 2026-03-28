"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { ERPAuthProvider, useERPAuth } from "@/src/components/erp/ERPAuthContext";
import "@/src/components/erp/erp.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function RegisterForm() {
  const { setTokenAndUser } = useERPAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenEmail, setTokenEmail] = useState("");

  const [isJoinMode, setIsJoinMode] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid invite link. Please contact your admin.");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const email = payload.sub || "";
      setTokenEmail(email);
      // Check if user already exists
      axios.post(`${API}/api/erp/auth/login`, { email, password: "dummy_checking_existence_only" })
        .catch(err => {
          if (err?.response?.data?.detail === "Invalid email or password") {
            // This means email exists but password wrong (good, we are in Join mode)
            setIsJoinMode(true);
          } else if (err?.response?.status === 401) {
             setIsJoinMode(true);
          }
        });
    } catch {
      setError("Invalid or expired invite token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/erp/auth/register`, { token, password, name: name || undefined });
      setTokenAndUser(res.data.access_token, res.data.user);
      router.push("/erp/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleJoin = () => {
    window.location.href = `${API}/api/erp/auth/google?invite_token=${token}`;
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #05050e 0%, #0f0518 50%, #05050e 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', 'Outfit', sans-serif", padding: "20px",
    }}>
      <div style={{
        width: "100%", maxWidth: "420px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(167,139,250,0.18)",
        borderRadius: "24px", padding: "40px 36px",
        backdropFilter: "blur(20px)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "16px",
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px", fontWeight: 800, color: "#fff", margin: "0 auto 16px",
          }}>E</div>
        <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 6px", color: "#fff" }}>
          {isJoinMode ? "Join Organization" : "Create Account"}
        </h1>
        {tokenEmail && (
          <p style={{ color: "#a78bfa", fontSize: "14px", margin: 0, marginBottom: "20px" }}>
            {isJoinMode ? "You already have an ERP account." : "Invited as:"} {tokenEmail}
          </p>
        )}
        </div>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "10px", padding: "12px 14px", marginBottom: "20px",
            color: "#f87171", fontSize: "14px",
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <button
            type="button"
            onClick={handleGoogleJoin}
            style={{
              width: "100%", padding: "13px", borderRadius: "10px", background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: "14px", fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", transition: "all 0.2s",
              marginBottom: "8px"
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a11.986 11.986 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            Join with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "8px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
            <span style={{ color: "#555", fontSize: "12px" }}>OR SET PASSWORD</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
          </div>

          {!isJoinMode && (
            <div>
              <label className="erp-label">Your Name (optional)</label>
              <input className="erp-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
            </div>
          )}
          <div>
            <label className="erp-label">{isJoinMode ? "Verify Password" : "Password"}</label>
            <input className="erp-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={isJoinMode ? "Enter your existing password" : "Min 6 characters"} required />
          </div>
          {!isJoinMode && (
            <div>
              <label className="erp-label">Confirm Password</label>
              <input className="erp-input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required />
            </div>
          )}
          <button
            type="submit" className="erp-btn erp-btn-primary"
            disabled={loading || !!error && !tokenEmail}
            style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: "15px", marginTop: "4px", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (isJoinMode ? "Joining..." : "Creating...") : (isJoinMode ? "Join & Enter Workspace" : "Create Account & Login")}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ERPRegisterPage() {
  return (
    <ERPAuthProvider>
      <Suspense fallback={<div style={{ color: "#fff", padding: "40px" }}>Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </ERPAuthProvider>
  );
}
