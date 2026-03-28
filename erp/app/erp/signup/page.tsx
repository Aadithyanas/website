"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ERPAuthProvider, useERPAuth } from "@/src/components/erp/ERPAuthContext";
import "@/src/components/erp/erp.css";

function SignupForm() {
  const { signup } = useERPAuth();
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(orgName, adminName, email, password, phone);
      router.push("/erp/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #05050e 0%, #0f0518 50%, #05050e 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "460px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(167,139,250,0.18)", borderRadius: "24px", padding: "40px 36px", backdropFilter: "blur(20px)" }}>
        <Link href="/erp/login" style={{ color: "#666", textDecoration: "none", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px", marginBottom: "24px" }}>← Back to Login</Link>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
           <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 6px", color: "#fff" }}>Create Organization</h1>
           <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>Start your team collaboration today</p>
        </div>

        {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "12px 14px", marginBottom: "20px", color: "#f87171", fontSize: "14px" }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label className="erp-label">Organization Name</label>
            <input className="erp-input" value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="e.g. Acme Corp" required />
          </div>
          <div>
            <label className="erp-label">Your Name (Admin)</label>
            <input className="erp-input" value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="John Doe" required />
          </div>
          <div>
            <label className="erp-label">Business Email</label>
            <input className="erp-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@org.com" required />
          </div>
          <div>
             <label className="erp-label">Password</label>
             <input className="erp-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="erp-btn erp-btn-primary" disabled={loading} style={{ width: "100%", padding: "13px", marginTop: "8px" }}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ERPSignupPage() {
  return (
    <ERPAuthProvider>
      <SignupForm />
    </ERPAuthProvider>
  );
}
