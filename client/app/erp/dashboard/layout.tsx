"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ERPAuthProvider, useERPAuth, apiClient } from "@/src/components/erp/ERPAuthContext";
import { ERPWebSocketProvider } from "@/src/components/erp/ERPWebSocketProvider";
import { useERPWS } from "@/src/components/erp/ERPWebSocketProvider";
import ERPSidebar from "@/src/components/erp/ERPSidebar";
import "@/src/components/erp/erp.css";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, token, loading } = useERPAuth();
  const { isConnected } = useERPWS();
  const router = useRouter();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/erp/login");
    }
  }, [loading, user, router]);
  useEffect(() => {
    if (token) {
      // Get unread count
      apiClient.get("/api/erp/notifications/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => setNotifCount(res.data.count || 0)).catch(() => {});

      // Mark all as read when coming to dashboard
      apiClient.put("/api/erp/notifications/read-all", {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(() => {
        // Optional: clear count locally after a short delay
        setTimeout(() => setNotifCount(0), 5000); 
      }).catch(() => {});
    }
  }, [token]);

  useEffect(() => {
    const handleNewNotif = (e: any) => {
      console.log("WebSocket Notification Received:", e.detail);
      setNotifCount(prev => prev + 1);
    };
    window.addEventListener("erp:notification_new" as any, handleNewNotif);
    return () => window.removeEventListener("erp:notification_new" as any, handleNewNotif);
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#000000", color: "#fff" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid #222", borderTopColor: "#fff", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "#888", fontSize: "14px" }}>Authenticating...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#000000", color: "#ffffff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <ERPSidebar notifCount={notifCount} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          borderBottom: "1px solid #1a1a1a",
          background: "#000",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#fff", letterSpacing: "0.05em" }}>
              WORKSPACE
            </h2>
            <div 
              title={isConnected ? "WebSocket Connected" : "WebSocket Disconnected"}
              style={{ 
                width: "6px", height: "6px", borderRadius: "50%", 
                background: isConnected ? "#10b981" : "#ef4444",
                boxShadow: isConnected ? "0 0 8px #10b981" : "none",
                transition: "0.3s"
              }} 
            />
          </div>
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
              padding: "4px 12px", borderRadius: "4px",
              background: "#fff", border: "1px solid #fff",
              color: "#000", fontSize: "11px", fontWeight: 800,
              textTransform: "uppercase", letterSpacing: "0.05em"
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
      <ERPWebSocketProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </ERPWebSocketProvider>
    </ERPAuthProvider>
  );
}
