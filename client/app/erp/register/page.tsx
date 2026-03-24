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

  useEffect(() => {
    if (!token) {
      setError("Invalid invite link. Please contact your admin.");
      return;
    }
    // Decode the JWT to show email
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setTokenEmail(payload.sub || "");
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
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 6px", color: "#fff" }}>Create Account</h1>
          {tokenEmail && (
            <p style={{ color: "#a78bfa", fontSize: "14px", margin: 0 }}>Invited as: {tokenEmail}</p>
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
          <div>
            <label className="erp-label">Your Name (optional)</label>
            <input className="erp-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
          </div>
          <div>
            <label className="erp-label">Password</label>
            <input className="erp-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required />
          </div>
          <div>
            <label className="erp-label">Confirm Password</label>
            <input className="erp-input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required />
          </div>
          <button
            type="submit" className="erp-btn erp-btn-primary"
            disabled={loading || !!error && !tokenEmail}
            style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: "15px", marginTop: "4px", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Creating account..." : "Create Account & Login"}
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
