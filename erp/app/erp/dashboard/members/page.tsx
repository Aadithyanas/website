"use client";
import React, { useEffect, useState } from "react";
import { useERPAuth, apiClient } from "@/src/components/erp/ERPAuthContext";
import { useRouter } from "next/navigation";

interface Member {
  id: string; name: string; email: string; phone?: string;
  position?: string; role: string; teams: string[]; team_role?: string; sprint?: string;
  avatar?: string; registered: boolean; base_salary: number;
  bank_name?: string; account_number?: string; ifsc_code?: string;
  permissions?: string[];
}

// Removed hardcoded TEAMS

export default function ERPMembersPage() {
  const { isAdmin, hasPermission, token } = useERPAuth();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  
  const [form, setForm] = useState({ 
    name: "", email: "", phone: "", position: "", teams: [] as string[], 
    team_role: "", sprint: "", role: "member", base_salary: 0,
    bank_name: "", account_number: "", ifsc_code: "",
    permissions: [] as string[]
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [availableSettings, setAvailableSettings] = useState({ positions: [] as string[], teams: [] as string[], sprints: [] as string[] });

  useEffect(() => {
    if (!isAdmin && !hasPermission("manage_members")) {
        router.replace("/erp/dashboard"); return;
    }
    fetchMembers();
    fetchSettings();
  }, [isAdmin, hasPermission, token]);

  const fetchSettings = async () => {
    try {
      const res = await apiClient.get("/api/erp/settings", { headers: { Authorization: `Bearer ${token}` } });
      setAvailableSettings(res.data);
    } catch (e) { console.error("Failed to fetch settings", e); }
  };

  const fetchMembers = async () => {
    try {
      const res = await apiClient.get("/api/erp/members", { headers: { Authorization: `Bearer ${token}` } });
      setMembers(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");
    try {
      if (editMember) {
        await apiClient.put(`/api/erp/members/${editMember.id}`, form, { headers: { Authorization: `Bearer ${token}` } });
        setMsg(`✅ Member updated successfully`);
      } else {
        await apiClient.post("/api/erp/members/invite", form, { headers: { Authorization: `Bearer ${token}` } });
        setMsg(`✅ Invite sent to ${form.email}`);
      }
      fetchMembers();
      setTimeout(() => { 
        setShowModal(false); 
        setEditMember(null); 
        setForm({ name: "", email: "", phone: "", position: "", teams: [], team_role: "", sprint: "", role: "member", base_salary: 0, bank_name: "", account_number: "", ifsc_code: "", permissions: [] }); 
        setMsg(""); 
      }, 1500);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail;
      setMsg(`❌ ${typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg) || "Failed to process"}`);
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (member: Member) => {
    if (!confirm(`Are you sure you want to remove ${member.name}?`)) return;
    try {
      await apiClient.delete(`/api/erp/members/${member.id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchMembers();
    } catch (e) { console.error(e); alert("Failed to delete member"); }
  };

  const openEdit = (m: Member) => {
    setEditMember(m);
    setForm({ 
      name: m.name, 
      email: m.email, 
      phone: m.phone || "", 
      position: m.position || "", 
      teams: m.teams || [], 
      team_role: m.team_role || "", 
      sprint: m.sprint || "", 
      role: m.role || "member",
      base_salary: m.base_salary || 0,
      bank_name: m.bank_name || "",
      account_number: m.account_number || "",
      ifsc_code: m.ifsc_code || "",
      permissions: m.permissions || []
    });
    setShowModal(true);
  };

  const toggleTeam = (team: string) => {
    setForm(prev => ({
      ...prev,
      teams: prev.teams.includes(team) ? prev.teams.filter(t => t !== team) : [...prev.teams, team]
    }));
  };

  const initials = (name: string) => name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  if (loading) return <div style={{ color: "#888", padding: "40px" }}>Loading members...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 4px", color: "#fff", letterSpacing: "-0.02em" }}>Team Members</h1>
          <p style={{ color: "#888", margin: 0, fontSize: "14px" }}>{members.length} members total in your organization.</p>
        </div>
        <button className="erp-btn erp-btn-primary" onClick={() => { setEditMember(null); setForm({ name: "", email: "", phone: "", position: "", teams: [], team_role: "", sprint: "", role: "member", base_salary: 0, bank_name: "", account_number: "", ifsc_code: "", permissions: [] }); setShowModal(true); setMsg(""); }}>
          + Invite Member
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {members.map(m => (
          <div key={m.id} className="erp-card" style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {m.avatar ? (
                <img src={m.avatar} alt={m.name} style={{ width: "48px", height: "48px", borderRadius: "9999px", border: "1px solid #333" }} />
              ) : (
                <div className="erp-avatar" style={{ width: "48px", height: "48px" }}>{initials(m.name)}</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "15px", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.email}</p>
              </div>
              <span className={`erp-badge erp-badge-${m.role}`}>{m.role}</span>
              {!m.registered && (
                <span className="erp-badge" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.3)", color: "#eab308", fontSize: "10px" }}>Pending</span>
              )}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {m.teams?.map(t => (
                <span key={t} className="erp-badge erp-badge-ongoing" style={{ fontSize: "10px", background: "#001a33", borderColor: "#003366" }}>{t}</span>
              ))}
              {m.team_role && <span className="erp-badge erp-badge-previewing" style={{ fontSize: "10px" }}>{m.team_role}</span>}
              {m.sprint && <span className="erp-badge erp-badge-pending" style={{ fontSize: "10px" }}>{m.sprint}</span>}
            </div>

            {m.position && <p style={{ margin: 0, fontSize: "13px", color: "#a78bfa", padding: "8px 12px", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "8px" }}>{m.position}</p>}
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#0a0a0a", borderRadius: "8px", border: "1px solid #111" }}>
              <span style={{ fontSize: "11px", color: "#666", fontWeight: 700 }}>BASE SALARY</span>
              <span style={{ fontSize: "14px", fontWeight: 800, color: "#34d399" }}>${m.base_salary?.toLocaleString() || "0"}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", borderTop: "1px solid #111", paddingTop: "12px", marginTop: "4px" }}>
              <button onClick={() => openEdit(m)} style={{ background: "#222", border: "1px solid #333", color: "#fff", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}>Edit</button>
              <button onClick={() => handleDelete(m)} style={{ background: "#1a0000", border: "1px solid #4d0000", color: "#ff4d4d", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      {/* Invite/Edit Modal */}
      {showModal && (
        <div className="erp-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="erp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <h2 style={{ margin: "0 0 24px", fontSize: "20px", fontWeight: 800, color: "#fff" }}>{editMember ? "Edit Member" : "Invite Member"}</h2>
            {msg && (
              <div style={{
                padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px",
                background: msg.startsWith("✅") ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${msg.startsWith("✅") ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.3)"}`,
                color: msg.startsWith("✅") ? "#34d399" : "#f87171",
              }}>{msg}</div>
            )}
            <form onSubmit={handleInvite} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="erp-label">Full Name *</label>
                <input className="erp-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" required />
              </div>
              <div>
                <label className="erp-label">Email *</label>
                <input className="erp-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" required disabled={!!editMember} />
              </div>
              <div>
                <label className="erp-label">Position *</label>
                <select className="erp-input erp-select" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} required>
                  <option value="">Select Position</option>
                  {availableSettings.positions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="erp-label">Working Teams (Select Multiple) *</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                  {availableSettings.teams.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTeam(t)}
                      style={{
                        padding: "6px 12px", borderRadius: "6px", fontSize: "13px", cursor: "pointer",
                        background: form.teams.includes(t) ? "#fff" : "#111",
                        color: form.teams.includes(t) ? "#000" : "#888",
                        border: `1px solid ${form.teams.includes(t) ? "#fff" : "#333"}`,
                        transition: "0.2s"
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label className="erp-label">Role</label>
                  <select className="erp-input erp-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="member">Member</option>
                    <option value="manager">Manager</option>
                    <option value="hr">HR</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="erp-label">Team Role</label>
                <select className="erp-input erp-select" value={form.team_role} onChange={e => setForm({ ...form, team_role: e.target.value })}>
                  <option value="">No specific role</option>
                  <option value="Team Leader">Team Leader</option>
                  <option value="Member">Member</option>
                  <option value="Assistant">Assistant</option>
                </select>
              </div>

              {/* Permissions Section */}
              <div style={{ marginTop: "8px", borderTop: "1px dashed #222", paddingTop: "16px" }}>
                <p style={{ margin: "0 0 12px", fontSize: "12px", fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Module Permissions</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {[
                    { id: "manage_members", label: "Members" },
                    { id: "manage_invoices", label: "Invoices" },
                    { id: "manage_payroll", label: "Payroll" },
                    { id: "manage_tasks", label: "Tasks" },
                    { id: "manage_org_settings", label: "Settings" },
                  ].map(perm => (
                    <label key={perm.id} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#ccc", fontSize: "13px" }}>
                      <input 
                        type="checkbox" 
                        checked={form.permissions.includes(perm.id)}
                        onChange={() => {
                          const next = form.permissions.includes(perm.id)
                            ? form.permissions.filter(p => p !== perm.id)
                            : [...form.permissions, perm.id];
                          setForm({ ...form, permissions: next });
                        }}
                        style={{ width: "14px", height: "14px", accentColor: "#f59e0b" }}
                      />
                      {perm.label}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label className="erp-label">Phone Number</label>
                  <input className="erp-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="e.g. +12345678" />
                </div>
                <div>
                  <label className="erp-label">Assigned Sprint</label>
                  <select className="erp-input erp-select" value={form.sprint} onChange={e => setForm({ ...form, sprint: e.target.value })}>
                    <option value="">No sprint</option>
                    {availableSettings.sprints.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="erp-label">Base Salary (Monthly)</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#666", fontSize: "14px" }}>$</span>
                  <input 
                    type="number" 
                    className="erp-input" 
                    style={{ paddingLeft: "28px" }}
                    value={form.base_salary} 
                    onChange={e => setForm({ ...form, base_salary: parseInt(e.target.value) || 0 })} 
                    placeholder="e.g. 5000" 
                  />
                </div>
              </div>

              {/* Banking Section */}
              <div style={{ marginTop: "8px", borderTop: "1px dashed #222", paddingTop: "16px" }}>
                <p style={{ margin: "0 0 12px", fontSize: "12px", fontWeight: 800, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.05em" }}>Banking Information</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                  <div>
                    <label className="erp-label">Bank Name</label>
                    <input className="erp-input" value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} placeholder="e.g. HDFC Bank" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label className="erp-label">Account Number</label>
                      <input className="erp-input" value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })} placeholder="1234567890" />
                    </div>
                    <div>
                      <label className="erp-label">IFSC Code</label>
                      <input className="erp-input" value={form.ifsc_code} onChange={e => setForm({ ...form, ifsc_code: e.target.value })} placeholder="HDFC000123" />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="button" className="erp-btn erp-btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="erp-btn erp-btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? "Processing..." : (editMember ? "Update Member" : "Send Invite")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
