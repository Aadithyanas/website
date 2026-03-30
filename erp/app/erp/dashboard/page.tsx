"use client";
import React, { useEffect, useState } from "react";
import { useERPAuth, apiClient } from "@/src/components/erp/ERPAuthContext";
import Link from "next/link";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Wallet, Receipt, Users } from "lucide-react";

interface Task { id: string; title: string; status: string; updated_at: string; }
interface Leave { id: string; date: string; status: string; description: string; }
interface Notif { id: string; message: string; read: boolean; created_at: string; task_id?: string; }

const statusColors: Record<string, string> = {
  pending: "#f59e0b", ongoing: "#60a5fa", testing: "#a78bfa",
  previewing: "#f472b6", completed: "#34d399",
};

const financialData = [
  { name: 'Jan', revenue: 4500, expenses: 3200 },
  { name: 'Feb', revenue: 5200, expenses: 3100 },
  { name: 'Mar', revenue: 4800, expenses: 4000 },
  { name: 'Apr', revenue: 6100, expenses: 3800 },
  { name: 'May', revenue: 5900, expenses: 4200 },
  { name: 'Jun', revenue: 7200, expenses: 4500 },
  { name: 'Jul', revenue: 8500, expenses: 4800 },
];

const COLORS = ['#34d399', '#60a5fa', '#f472b6', '#fbbf24'];

export default function ERPDashboardPage() {
  const { user, token, isAdmin, hasPermission } = useERPAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const h = { Authorization: `Bearer ${token}` };
    const canSeeMembers = isAdmin || hasPermission("manage_members");
    Promise.all([
      apiClient.get("/api/erp/tasks", { headers: h }),
      apiClient.get("/api/erp/attendance", { headers: h }),
      apiClient.get("/api/erp/notifications", { headers: h }),
      ...(canSeeMembers ? [apiClient.get("/api/erp/members", { headers: h })] : []),
    ]).then(([t, a, n, m]) => {
      setTasks(t.data);
      setLeaves(a.data);
      setNotifs(n.data.filter((x: Notif) => !x.read).slice(0, 5));
      if (m) setMembers(m.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [token, isAdmin, hasPermission]);

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
        {(isAdmin || hasPermission("manage_members")) && (
          <StatCard title="Total Members" value={members.length} color="#a78bfa" icon="👥" href="/erp/dashboard/members" />
        )}
        <StatCard title="Total Tasks" value={tasks.length} color="#60a5fa" icon="📋" href="/erp/dashboard/tasks" />
        <StatCard title="Completed" value={tasksByStatus("completed")} color="#34d399" icon="✅" href="/erp/dashboard/tasks" />
        <StatCard title="In Progress" value={tasksByStatus("ongoing")} color="#f59e0b" icon="⚡" href="/erp/dashboard/tasks" />
        <StatCard title="Pending Leaves" value={leaves.filter(l => l.status === "pending").length} color="#f472b6" icon="📅" href="/erp/dashboard/attendance" />
      </div>

      {/* Financial Insights */}
      {(isAdmin || hasPermission("manage_payroll")) && (
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={20} className="text-indigo-400" />
              Financial Insights
            </h2>
            <div style={{ fontSize: "12px", color: "#888", display: "flex", gap: "12px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#34d399" }} /> Revenue</span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#f87171" }} /> Expenses</span>
            </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
            <div className="erp-card" style={{ height: "300px", padding: "20px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financialData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#555" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#555" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ background: "#0c0c0c", border: "1px solid #222", borderRadius: "8px", fontSize: "12px" }}
                    itemStyle={{ fontWeight: "bold" }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#34d399" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" stroke="#f87171" fillOpacity={1} fill="url(#colorExp)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="erp-card" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: "14px", color: "#888" }}>Net Profit (Monthly)</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span style={{ fontSize: "24px", fontWeight: 800, color: "#fff" }}>$12,450.00</span>
                  <span style={{ fontSize: "12px", color: "#34d399", display: "flex", alignItems: "center", gap: "2px" }}>
                    <TrendingUp size={12} /> +12%
                  </span>
                </div>
              </div>

              <div style={{ height: "140px", marginTop: "20px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Payroll', value: 6500 },
                        { name: 'SaaS', value: 1200 },
                        { name: 'Marketing', value: 2100 },
                        { name: 'Office', value: 2650 },
                      ]}
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {financialData.map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ background: "#0c0c0c", border: "1px solid #222", borderRadius: "8px", fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px" }}>
                 <div style={{ padding: "8px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <p style={{ margin: 0, fontSize: "10px", color: "#555", textTransform: "uppercase" }}>Burn Rate</p>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#f87171" }}>$4.2k/mo</p>
                 </div>
                 <div style={{ padding: "8px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <p style={{ margin: 0, fontSize: "10px", color: "#555", textTransform: "uppercase" }}>Runway</p>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#60a5fa" }}>18 Months</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

        {/* Admin/HR/Manager: Member cards */}
        {(isAdmin || hasPermission("manage_members")) && (
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
