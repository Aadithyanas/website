"use client";
import React, { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ERPAuthProvider, useERPAuth } from "@/src/components/erp/ERPAuthContext";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function Callback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setTokenAndUser } = useERPAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error === "not_invited") {
      router.replace("/erp/login?error=not_invited");
      return;
    }

    if (token) {
      axios.get(`${API}/api/erp/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => {
        setTokenAndUser(token, res.data);
        router.replace("/erp/dashboard");
      }).catch(() => {
        router.replace("/erp/login?error=auth_failed");
      });
    } else {
      router.replace("/erp/login");
    }
  }, [searchParams, router, setTokenAndUser]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "#05050e", color: "#fff", fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "12px",
          background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
          margin: "0 auto 16px", animation: "spin 1s linear infinite",
        }} />
        <p style={{ color: "#888" }}>Signing you in...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <ERPAuthProvider>
      <Suspense fallback={<div style={{ color: "#fff", padding: "40px" }}>Loading...</div>}>
        <Callback />
      </Suspense>
    </ERPAuthProvider>
  );
}
