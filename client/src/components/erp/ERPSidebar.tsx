"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useERPAuth } from "./ERPAuthContext";

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

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/erp/dashboard", icon: <HomeIcon /> },
  { label: "Members", href: "/erp/dashboard/members", icon: <UsersIcon />, adminOnly: true },
  { label: "Tasks", href: "/erp/dashboard/tasks", icon: <TaskIcon /> },
  { label: "Attendance", href: "/erp/dashboard/attendance", icon: <CalendarIcon /> },
];

interface ERPSidebarProps {
  notifCount?: number;
}

export default function ERPSidebar({ notifCount = 0 }: ERPSidebarProps) {
  const { user, isAdmin, logout } = useERPAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

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
        background: "linear-gradient(180deg, #0f0f1a 0%, #0a0a12 100%)",
        borderRight: "1px solid rgba(167,139,250,0.15)",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        position: "sticky",
        top: 0,
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid rgba(167,139,250,0.1)",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "14px",
            color: "#fff",
            flexShrink: 0,
          }}
        >
          E
        </div>
        {!collapsed && (
          <span style={{ fontWeight: 700, fontSize: "16px", color: "#fff", whiteSpace: "nowrap" }}>
            Team ERP
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            color: "#888",
            cursor: "pointer",
            padding: "4px",
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={collapsed ? "M9 5l7 7-7 7" : "M15 5l-7 7 7 7"} />
          </svg>
        </button>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: "12px 8px" }}>
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
                borderRadius: "10px",
                marginBottom: "4px",
                color: isActive ? "#a78bfa" : "#888",
                background: isActive ? "rgba(167,139,250,0.12)" : "transparent",
                textDecoration: "none",
                transition: "all 0.2s",
                fontWeight: isActive ? 600 : 400,
                fontSize: "14px",
                whiteSpace: "nowrap",
                overflow: "hidden",
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
                background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
          )}
          {!collapsed && (
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name}
              </p>
              <p style={{ fontSize: "11px", color: "#a78bfa", margin: 0 }}>{user?.role}</p>
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
