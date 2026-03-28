"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ERPAuthProvider, useERPAuth, apiClient } from "@/src/components/erp/ERPAuthContext";
import { ERPWebSocketProvider } from "@/src/components/erp/ERPWebSocketProvider";
import { useERPWS } from "@/src/components/erp/ERPWebSocketProvider";
import ERPSidebar from "@/src/components/erp/ERPSidebar";
import { Menu } from "lucide-react";
import "@/src/components/erp/erp.css";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, token, loading } = useERPAuth();
  const { isConnected } = useERPWS();
  const router = useRouter();
  const [notifCount, setNotifCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#222] border-t-white mx-auto mb-4 animate-spin" />
          <p className="text-[#888] text-sm font-semibold tracking-wider">AUTHENTICATING...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-black text-white font-sans antialiased selection:bg-white/20">
      <ERPSidebar notifCount={notifCount} mobileOpen={mobileOpen} closeMobile={() => setMobileOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 bg-[#000]">
        
        {/* Top bar */}
        <header className="h-[60px] flex items-center justify-between px-4 sm:px-8 border-b border-[#1a1a1a] bg-[#000] sticky top-0 z-10 transition-colors">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white hover:bg-[#111] rounded-lg transition-colors outline-none"
              onClick={() => setMobileOpen(true)}
              aria-label="Open Menu"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <h2 className="m-0 text-[13px] font-extrabold text-white tracking-[0.15em] uppercase hidden sm:block">
                WORKSPACE
              </h2>
              <div 
                title={isConnected ? "WebSocket Connected" : "WebSocket Disconnected"}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${isConnected ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-red-500 shadow-[0_0_10px_#ef4444]"}`} 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {notifCount > 0 && (
              <span className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-full text-[11px] font-bold px-3 py-1 ml-auto">
                {notifCount} unread
              </span>
            )}
            <div className="px-3.5 py-1.5 rounded-lg bg-[#111] border border-[#222] text-gray-300 text-[11px] font-extrabold uppercase tracking-widest hidden sm:block">
              {user.role}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto no-scrollbar scroll-smooth">
          <div className="max-w-[1600px] mx-auto w-full">
            {children}
          </div>
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
