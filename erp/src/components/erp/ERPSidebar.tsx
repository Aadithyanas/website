"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useERPAuth, apiClient } from "./ERPAuthContext";
import { X } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  permission?: string;
}

const HomeIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
  </svg>
);
const UsersIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const TaskIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);
const CalendarIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CogIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.543-.426-1.543-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BanknotesIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const DocumentIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ReceiptIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.5m.5 0h.5m.5 0h.5m-3 3h.5m.5 0h.5m.5 0h.5m-3 3h.5m.5 0h.5m.5 0h.5M21 21H3V3h18v18z" />
  </svg>
);

const FolderIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/erp/dashboard", icon: <HomeIcon /> },
  { label: "Projects", href: "/erp/dashboard/projects", icon: <FolderIcon /> },
  { label: "Tasks", href: "/erp/dashboard/tasks", icon: <TaskIcon /> },
  { label: "Attendance", href: "/erp/dashboard/attendance", icon: <CalendarIcon /> },
  { label: "Clients", href: "/erp/dashboard/clients", icon: <BriefcaseIcon /> },
  { label: "Invoices", href: "/erp/dashboard/invoices", icon: <DocumentIcon />, permission: "manage_invoices" },
  { label: "Expenses", href: "/erp/dashboard/expenses", icon: <ReceiptIcon />, permission: "manage_payroll" },
  { label: "Profile", href: "/erp/dashboard/profile", icon: <UserIcon /> },
  { label: "Members", href: "/erp/dashboard/members", icon: <UsersIcon />, adminOnly: true, permission: "manage_members" },
  { label: "Payroll", href: "/erp/dashboard/payroll", icon: <BanknotesIcon />, adminOnly: true, permission: "manage_payroll" },
  { label: "Settings", href: "/erp/dashboard/settings", icon: <CogIcon />, adminOnly: true, permission: "manage_org_settings" },
];

interface ERPSidebarProps {
  notifCount?: number;
  mobileOpen?: boolean;
  closeMobile?: () => void;
}

export default function ERPSidebar({ notifCount = 0, mobileOpen = false, closeMobile }: ERPSidebarProps) {
  const { user, token, isAdmin, hasPermission, logout, switchOrganization } = useERPAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [showOrgPicker, setShowOrgPicker] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);

  React.useEffect(() => {
    if (token) {
      apiClient.get("/api/erp/auth/accounts", { headers: { Authorization: `Bearer ${token}` } })
        .then((res: any) => setAccounts(res.data))
        .catch((e: any) => console.error("Failed to fetch accounts", e));
    }
  }, [token]);

  const filteredItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) {
        // Even if adminOnly, check if they have specific permission
        if (item.permission && hasPermission(item.permission)) return true;
        return false;
    }
    if (item.permission && !hasPermission(item.permission)) return false;
    return true;
  });

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  // Sidebar content component to reuse for both desktop and mobile
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-black border-r border-[#1a1a1a] w-[250px] transition-all duration-300 shadow-2xl">
      {/* ── Logo & Org Picker ── */}
      <div className="p-4 border-b border-[#1a1a1a] relative">
        <div 
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => setShowOrgPicker(!showOrgPicker)}
        >
          <div className="w-9 h-9 rounded-xl bg-white text-black shrink-0 flex items-center justify-center font-black text-lg shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-xl object-cover" />
            ) : (
              "E"
            )}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-white truncate w-full">
                {user?.org_name || "Team ERP"}
              </span>
              <svg 
                width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" 
                className={`text-gray-500 transition-transform flex-shrink-0 ${showOrgPicker ? "rotate-180" : ""}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Workspace</span>
          </div>
        </div>

        {/* Picker Dropdown */}
        {showOrgPicker && (
          <div className="absolute top-16 left-3 right-3 bg-[#0a0a0a] border border-[#222] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-1 flex flex-col gap-0.5">
              {accounts.map(acc => (
                <button
                  key={acc.org_id}
                  onClick={() => { switchOrganization(acc.org_id); setShowOrgPicker(false); if (closeMobile) closeMobile(); }}
                  className={`flex items-center gap-2.5 p-2 rounded-lg text-left w-full transition-colors ${
                    acc.org_id === user?.org_id ? "bg-[#161616] text-white" : "text-gray-400 hover:bg-[#111] hover:text-white"
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-[#222] text-[10px] font-bold flex items-center justify-center shrink-0">
                    {acc.org_name[0].toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold truncate">{acc.org_name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1 outline-none no-scrollbar">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobile}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 outline-none ${
                isActive 
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                  : "text-gray-400 hover:text-white hover:bg-[#111]"
              }`}
            >
              <span className={`shrink-0 ${isActive ? "text-black" : "text-gray-500 group-hover:text-white"}`}>
                {item.icon}
              </span>
              <span className="text-sm font-semibold truncate flex-1 tracking-wide">{item.label}</span>
              {item.label === "Dashboard" && notifCount > 0 && (
                <span className="bg-red-500 text-white rounded-full text-[10px] font-bold px-1.5 min-w-[18px] text-center ml-auto">
                  {notifCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Profile Footer ── */}
      <div className="p-4 border-t border-[#1a1a1a]">
        <div className="flex items-center gap-3 p-2 mb-2">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full shrink-0 object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#111] border border-[#333] flex items-center justify-center text-xs font-bold text-white shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200 outline-none"
        >
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile Drawer ── */}
      <div 
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={closeMobile}
        />
        {/* Slide-in panel */}
        <div 
          className={`absolute top-0 bottom-0 left-0 transition-transform duration-300 ease-in-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarContent />
          {/* Close button inside mobile menu */}
          <button 
            className="absolute top-4 -right-12 w-10 h-10 bg-black border border-[#1a1a1a] rounded-xl text-gray-400 flex items-center justify-center shadow-2xl"
            onClick={closeMobile}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* ── Desktop Sidebar ── */}
      <div className="hidden md:flex h-full flex-shrink-0">
        <SidebarContent />
      </div>
    </>
  );
}
