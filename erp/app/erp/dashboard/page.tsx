"use client";
import React, { useEffect, useState } from "react";
import { useERPAuth, apiClient } from "@/src/components/erp/ERPAuthContext";
import Link from "next/link";

interface Task { id: string; title: string; status: string; updated_at: string; }
interface Leave { id: string; date: string; status: string; description: string; }
interface Notif { id: string; message: string; read: boolean; created_at: string; task_id?: string; }

const statusColors: Record<string, string> = {
  pending: "#f59e0b", ongoing: "#60a5fa", testing: "#a78bfa",
  previewing: "#f472b6", completed: "#34d399",
};

export default function ERPDashboardPage() {
  const { user, token, isAdmin } = useERPAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const h = { Authorization: `Bearer ${token}` };
    Promise.all([
      apiClient.get("/api/erp/tasks", { headers: h }),
      apiClient.get("/api/erp/attendance", { headers: h }),
      apiClient.get("/api/erp/notifications", { headers: h }),
      ...(isAdmin ? [apiClient.get("/api/erp/members", { headers: h })] : []),
    ]).then(([t, a, n, m]) => {
      setTasks(t.data);
      setLeaves(a.data);
      setNotifs(n.data.filter((x: Notif) => !x.read).slice(0, 5));
      if (m) setMembers(m.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [token, isAdmin]);

  const tasksByStatus = (s: string) => tasks.filter(t => t.status === s).length;

  if (loading) return <div style={{ color: "#888" }}>Loading dashboard...</div>;

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 700, margin: "0 0 4px", color: "#fff" }}>
          Welcome back, {user?.name?.split(" ")[0] || "there"} 👋
        </h1>
        <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        {isAdmin && (
          <StatCard title="Total Members" value={members.length} color="#a78bfa" icon="👥" href="/erp/dashboard/members" />
        )}
        <StatCard title="Total Tasks" value={tasks.length} color="#60a5fa" icon="📋" href="/erp/dashboard/tasks" />
        <StatCard title="Completed" value={tasksByStatus("completed")} color="#34d399" icon="✅" href="/erp/dashboard/tasks" />
        <StatCard title="In Progress" value={tasksByStatus("ongoing")} color="#f59e0b" icon="⚡" href="/erp/dashboard/tasks" />
        <StatCard title="Pending Leaves" value={leaves.filter(l => l.status === "pending").length} color="#f472b6" icon="📅" href="/erp/dashboard/attendance" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "1fr 1fr" : "1fr", gap: "20px" }}>
        {/* Recent Tasks */}
        <div className="erp-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#fff" }}>Recent Tasks</h3>
            <Link href="/erp/dashboard/tasks" style={{ color: "#a78bfa", fontSize: "13px", textDecoration: "none" }}>View all →</Link>
          </div>
          {tasks.length === 0 && <p style={{ color: "#555", fontSize: "14px" }}>No tasks yet.</p>}
          {tasks.slice(0, 5).map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "9999px", background: statusColors[t.status] || "#888", flexShrink: 0 }} />
              <span style={{ fontSize: "14px", color: "#ccc", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
              <span className={`erp-badge erp-badge-${t.status}`}>{t.status}</span>
            </div>
          ))}
        </div>

        {/* Notifications */}
        <div className="erp-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#fff" }}>
              Notifications {notifs.length > 0 && <span style={{ width: "8px", height: "8px", borderRadius: "9999px", background: "#ef4444", display: "inline-block", marginLeft: "6px", verticalAlign: "middle" }} />}
            </h3>
          </div>
          {notifs.length === 0 && <p style={{ color: "#555", fontSize: "14px" }}>All caught up! 🎉</p>}
          {notifs.map(n => (
            <div key={n.id} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <p style={{ margin: 0, fontSize: "13px", color: "#ccc" }}>{n.message}</p>
              <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#555" }}>
                {new Date(n.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Admin: Member cards */}
        {isAdmin && (
          <div className="erp-card" style={{ gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#fff" }}>Team Members</h3>
              <Link href="/erp/dashboard/members" style={{ color: "#a78bfa", fontSize: "13px", textDecoration: "none" }}>Manage →</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
              {members.map((m: any) => (
                <MemberCard key={m.id} member={m} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon, href }: any) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div className="erp-card" style={{ cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "24px" }}>{icon}</span>
          <div>
            <p style={{ margin: 0, fontSize: "28px", fontWeight: 700, color }}>{value}</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#888", marginTop: "2px" }}>{title}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function MemberCard({ member }: { member: any }) {
  const initials = member.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  return (
    <div style={{
      padding: "14px", borderRadius: "12px",
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(167,139,250,0.1)",
      display: "flex", alignItems: "center", gap: "10px",
    }}>
      {member.avatar ? (
        <img src={member.avatar} alt={member.name} style={{ width: "36px", height: "36px", borderRadius: "9999px" }} />
      ) : (
        <div className="erp-avatar" style={{ width: "36px", height: "36px", fontSize: "12px" }}>{initials}</div>
      )}
      <div style={{ overflow: "hidden" }}>
        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{member.name}</p>
        <p style={{ margin: 0, fontSize: "11px", color: "#666" }}>{member.position || member.role}</p>
      </div>
    </div>
  );
}
