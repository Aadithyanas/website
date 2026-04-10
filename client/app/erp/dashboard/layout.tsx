"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ERPAuthProvider, useERPAuth, apiClient } from "@/src/components/erp/ERPAuthContext";
import { ERPWebSocketProvider } from "@/src/components/erp/ERPWebSocketProvider";
import { useERPWS } from "@/src/components/erp/ERPWebSocketProvider";
import ERPSidebar from "@/src/components/erp/ERPSidebar";
import { Menu, Search, Command, Zap, ArrowRight, X } from "lucide-react";
import "@/src/components/erp/erp.css";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, token, loading, isAdmin, hasPermission } = useERPAuth();
  const { isConnected } = useERPWS();
  const router = useRouter();
  const [notifCount, setNotifCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCommandBar, setShowCommandBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandBar(prev => !prev);
      }
      if (e.key === 'Escape') setShowCommandBar(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands = [
    { id: 'tasks', label: 'Go to Tasks', icon: <Zap size={16} />, href: '/erp/dashboard/tasks' },
    { id: 'projects', label: 'View Projects', icon: <Zap size={16} />, href: '/erp/dashboard/projects', permission: 'manage_projects' },
    { id: 'payroll', label: 'Manage Payroll', icon: <Zap size={16} />, href: '/erp/dashboard/payroll', permission: 'manage_payroll' },
    { id: 'invoices', label: 'Invoices & Billing', icon: <Zap size={16} />, href: '/erp/dashboard/invoices', permission: 'manage_invoices' },
    { id: 'expenses', label: 'Expense Reports', icon: <Zap size={16} />, href: '/erp/dashboard/expenses', permission: 'manage_payroll' },
    { id: 'clients', label: 'Client Directory', icon: <Zap size={16} />, href: '/erp/dashboard/clients', permission: 'manage_members' },
    { id: 'attendance', label: 'Attendance & Leaves', icon: <Zap size={16} />, href: '/erp/dashboard/attendance' },
    { id: 'settings', label: 'Organization Settings', icon: <Zap size={16} />, href: '/erp/dashboard/settings', adminOnly: true },
  ].filter(c => {
    if (c.adminOnly && user?.role !== 'admin') return false;
    if (c.permission && !hasPermission(c.permission)) return false;
    if (!searchQuery) return true;
    return c.label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCommand = (href: string) => {
    router.push(href);
    setShowCommandBar(false);
    setSearchQuery("");
  };

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
            {/* Quick Search Shortcut Indicator */}
            <div 
              onClick={() => setShowCommandBar(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#111] hover:border-indigo-500/50 cursor-pointer group transition-all"
            >
              <Search size={14} className="text-gray-500 group-hover:text-white" />
              <span className="text-[11px] text-gray-500 font-bold group-hover:text-gray-300">Quick Command</span>
              <kbd className="hidden sm:inline-flex h-4 items-center gap-1 rounded border border-[#222] bg-[#111] px-1.5 font-mono text-[9px] font-medium text-gray-400">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>

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

      {/* Command Bar Modal */}
      {showCommandBar && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 sm:pt-40 p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowCommandBar(false)} />
          
          <div className="relative w-full max-w-xl bg-[#050505] border border-[#222] rounded-2xl shadow-[0_32px_128px_rgba(0,0,0,1)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="flex items-center gap-4 px-5 py-4 border-b border-[#1a1a1a]">
                <Command size={20} className="text-indigo-500" />
                <input 
                  autoFocus
                  className="w-full bg-transparent border-none text-white text-base placeholder-gray-600 outline-none"
                  placeholder="Type a command or search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 bg-[#111] px-2 py-1 rounded-md">
                   ESC
                </div>
             </div>
             
             <div className="max-h-[360px] overflow-y-auto p-2 no-scrollbar">
                {commands.length === 0 ? (
                  <div className="p-10 text-center text-gray-600 italic text-sm">
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {commands.map((cmd) => (
                      <button
                        key={cmd.id}
                        onClick={() => handleCommand(cmd.href)}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-indigo-600/10 hover:text-indigo-400 text-gray-400 text-left transition-all group"
                      >
                         <div className="w-8 h-8 rounded-lg bg-[#0a0a0a] group-hover:bg-indigo-500/20 border border-[#111] group-hover:border-indigo-500/30 flex items-center justify-center transition-colors">
                            {cmd.icon}
                         </div>
                         <span className="flex-1 text-sm font-bold tracking-wide">{cmd.label}</span>
                         <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </button>
                    ))}
                  </div>
                )}
             </div>

             <div className="p-4 bg-[#0a0a0a] border-t border-[#1a1a1a] flex justify-between items-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                <span>Total {commands.length} Commands</span>
                <span className="flex items-center gap-4">
                   <span>↑↓ Navigate</span>
                   <span>⏎ Enter</span>
                </span>
             </div>
          </div>
        </div>
      )}
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
