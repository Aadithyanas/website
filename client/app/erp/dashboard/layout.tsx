"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ERPAuthProvider, useERPAuth, apiClient } from "@/src/components/erp/ERPAuthContext";
import ERPSidebar from "@/src/components/erp/ERPSidebar";
import "@/src/components/erp/erp.css";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, token, loading } = useERPAuth();
  const router = useRouter();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/erp/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (token) {
      apiClient.get("/api/erp/notifications/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => setNotifCount(res.data.count || 0)).catch(() => {});
    }
  }, [token]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#05050e", color: "#fff" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, #7c3aed, #a78bfa)", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
          <p style={{ color: "#888" }}>Loading...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#05050e", fontFamily: "'Inter', 'Outfit', sans-serif" }}>
      <ERPSidebar notifCount={notifCount} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          borderBottom: "1px solid rgba(167,139,250,0.1)",
          background: "rgba(5,5,14,0.8)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#fff" }}>
            Team ERP
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {notifCount > 0 && (
              <span style={{
                background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171", borderRadius: "9999px", fontSize: "12px",
                fontWeight: 700, padding: "2px 10px",
              }}>
                {notifCount} new
              </span>
            )}
            <div style={{
              padding: "6px 14px", borderRadius: "9999px",
              background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)",
              color: "#a78bfa", fontSize: "13px", fontWeight: 600,
            }}>
              {user.role === "admin" ? "Admin" : "Member"}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main style={{ flex: 1, padding: "28px", overflow: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function ERPDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ERPAuthProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </ERPAuthProvider>
  );
}
