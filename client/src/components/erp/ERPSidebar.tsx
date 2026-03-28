"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useERPAuth, apiClient } from "./ERPAuthContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
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

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/erp/dashboard", icon: <HomeIcon /> },
  { label: "Members", href: "/erp/dashboard/members", icon: <UsersIcon />, adminOnly: true },
  { label: "Tasks", href: "/erp/dashboard/tasks", icon: <TaskIcon /> },
  { label: "Attendance", href: "/erp/dashboard/attendance", icon: <CalendarIcon /> },
  { label: "Org Settings", href: "/erp/dashboard/settings", icon: <CogIcon />, adminOnly: true },
  { label: "Payroll", href: "/erp/dashboard/payroll", icon: <BanknotesIcon />, adminOnly: true },
  { label: "My Profile", href: "/erp/dashboard/profile", icon: <UserIcon /> },
];

interface ERPSidebarProps {
  notifCount?: number;
}

export default function ERPSidebar({ notifCount = 0 }: ERPSidebarProps) {
  const { user, token, isAdmin, logout, switchOrganization } = useERPAuth();
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

  const filteredItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <aside
      className="erp-sidebar"
      style={{
        width: collapsed ? "72px" : "240px",
        transition: "width 0.3s ease",
        background: "#000000",
        borderRight: "1px solid #222",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        height: "100vh",
        position: "sticky",
        top: 0,
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Logo & Org Picker */}
      <div
        style={{
          padding: "20px 16px",
          borderBottom: "1px solid rgba(167,139,250,0.1)",
          position: "relative"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => !collapsed && setShowOrgPicker(!showOrgPicker)}>
          <div
            style={{
              width: "36px", height: "36px", borderRadius: "10px", background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: "18px", color: "#000", flexShrink: 0,
            }}
          >
            {user?.avatar ? <img src={user.avatar} style={{ width: "100%", height: "100%", borderRadius: "10px", objectFit: "cover" }} /> : "E"}
          </div>
          {!collapsed && (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ fontWeight: 800, fontSize: "14px", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.org_name || "Team ERP"}
                </span>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ transform: showOrgPicker ? "rotate(180deg)" : "none", transition: "0.2s", color: "#666" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <span style={{ fontSize: "10px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>WORKSPACE</span>
            </div>
          )}
        </div>

        {/* Org Picker Dropdown */}
        {!collapsed && showOrgPicker && (
          <div style={{
            position: "absolute", top: "70px", left: "12px", right: "12px",
            background: "#0a0a0a", border: "1px solid #222", borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)", zIndex: 100, overflow: "hidden"
          }}>
            <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "2px" }}>
              {accounts.map(acc => (
                <button
                  key={acc.org_id}
                  onClick={() => { switchOrganization(acc.org_id); setShowOrgPicker(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px", padding: "8px", borderRadius: "6px",
                    background: acc.org_id === user?.org_id ? "#111" : "transparent",
                    border: "none", color: acc.org_id === user?.org_id ? "#fff" : "#999",
                    cursor: "pointer", textAlign: "left", width: "100%", transition: "0.2s"
                  }}
                >
                   <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "#333", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                     {acc.org_name[0].toUpperCase()}
                   </div>
                   <span style={{ fontSize: "13px", fontWeight: 600 }}>{acc.org_name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Global Expand/Collapse Button - More prominent */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: "absolute", right: "-12px", top: "28px", width: "26px", height: "26px",
            background: "#fff", border: "1px solid #ddd", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#000", cursor: "pointer", zIndex: 101, boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            transition: "all 0.2s"
          }}
          onMouseOver={e => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
          </svg>
        </button>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto", scrollbarWidth: "none" }}>
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 12px",
                marginBottom: "4px",
                color: isActive ? "#fff" : "#666",
                background: isActive ? "#111" : "transparent",
                textDecoration: "none",
                transition: "all 0.2s",
                fontWeight: isActive ? 700 : 500,
                fontSize: "14px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                borderLeft: isActive ? "3px solid #fff" : "3px solid transparent",
                borderRadius: isActive ? "0 4px 4px 0" : "4px",
              }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.label === "Dashboard" && notifCount > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "#ef4444",
                    color: "#fff",
                    borderRadius: "9999px",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "1px 6px",
                  }}
                >
                  {notifCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div
        style={{
          padding: "16px 8px",
          borderTop: "1px solid rgba(167,139,250,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 12px",
            borderRadius: "10px",
            marginBottom: "8px",
          }}
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              style={{ width: "32px", height: "32px", borderRadius: "9999px", flexShrink: 0 }}
            />
          ) : (
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "9999px",
                background: "#111",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 700,
                color: "#fff",
                border: "1px solid #333",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
          )}
          {!collapsed && (
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name}
              </p>
              <p style={{ fontSize: "11px", color: "#888", margin: 0 }}>{user?.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            padding: "10px 12px",
            borderRadius: "10px",
            background: "none",
            border: "none",
            color: "#ef4444",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
            transition: "background 0.2s",
          }}
        >
          <LogoutIcon />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
