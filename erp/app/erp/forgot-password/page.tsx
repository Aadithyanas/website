"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/src/components/erp/ERPAuthContext";

export default function ERPForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await apiClient.post("/api/erp/auth/forgot-password", { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0a0a0f", fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        width: "100%", maxWidth: "420px", padding: "40px",
        background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(167, 139, 250, 0.15)",
        borderRadius: "20px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        backdropFilter: "blur(20px)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "24px", color: "#fff", margin: "0 0 10px", fontWeight: "700" }}>Reset Password</h1>
          <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>Enter your email to receive a reset link</p>
        </div>

        {success ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ padding: "16px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: "12px", color: "#34d399", marginBottom: "20px" }}>
              ✅ If that email is registered, a password reset link has been sent. Please check your inbox.
            </div>
            <Link href="/erp/login" style={{ color: "#a78bfa", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
              ← Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {error && (
              <div style={{ padding: "12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", color: "#f87171", fontSize: "13px" }}>
                {error}
              </div>
            )}
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#a78bfa", letterSpacing: "1px" }}>EMAIL ADDRESS</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                style={{
                  padding: "14px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)", color: "#fff", fontSize: "15px", outline: "none", transition: "all 0.2s"
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#a78bfa"; e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"; e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"; }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "14px", borderRadius: "12px", background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                color: "#fff", fontSize: "15px", fontWeight: "700", border: "none", cursor: submitting ? "not-allowed" : "pointer",
                marginTop: "10px", transition: "opacity 0.2s", opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? "Sending Link..." : "Send Reset Link"}
            </button>

            <div style={{ textAlign: "center", marginTop: "10px" }}>
              <Link href="/erp/login" style={{ color: "#888", textDecoration: "none", fontSize: "13px" }}>
                Remembered your password? <span style={{ color: "#a78bfa", fontWeight: "600" }}>Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
