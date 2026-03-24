"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/src/components/erp/ERPAuthContext";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await apiClient.post("/api/erp/auth/reset-password", { token, new_password: password });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to reset password. The link might be expired.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#f87171", marginBottom: "20px" }}>Invalid or missing reset token.</p>
        <Link href="/erp/forgot-password" style={{ color: "#a78bfa", textDecoration: "none", fontWeight: "600" }}>Request a new link</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ padding: "16px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: "12px", color: "#34d399", marginBottom: "20px" }}>
          ✅ Password has been reset successfully!
        </div>
        <Link href="/erp/login" style={{ color: "#a78bfa", textDecoration: "none", fontSize: "14px", fontWeight: "600", padding: "10px 20px", background: "rgba(167,139,250,0.1)", borderRadius: "8px" }}>
          Go to Sign In →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {error && (
        <div style={{ padding: "12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", color: "#f87171", fontSize: "13px" }}>
          {error}
        </div>
      )}
      
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={{ fontSize: "12px", fontWeight: "600", color: "#a78bfa", letterSpacing: "1px" }}>NEW PASSWORD</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "14px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)", color: "#fff", fontSize: "15px", outline: "none", transition: "all 0.2s"
          }}
          minLength={6}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={{ fontSize: "12px", fontWeight: "600", color: "#a78bfa", letterSpacing: "1px" }}>CONFIRM PASSWORD</label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{
            padding: "14px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)", color: "#fff", fontSize: "15px", outline: "none", transition: "all 0.2s"
          }}
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
        {submitting ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}

export default function ERPResetPasswordPage() {
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
          <h1 style={{ fontSize: "24px", color: "#fff", margin: "0 0 10px", fontWeight: "700" }}>Set New Password</h1>
          <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>Create a strong password for your account</p>
        </div>
        
        <Suspense fallback={<div style={{ color: "#888", textAlign: "center" }}>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
