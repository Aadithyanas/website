"use client";
import React, { useEffect, useState } from "react";
import { useERPAuth, apiClient } from "@/src/components/erp/ERPAuthContext";
import { useRouter } from "next/navigation";

export default function ERPSettingsPage() {
  const { isAdmin, token } = useERPAuth();
  const router = useRouter();
  const [settings, setSettings] = useState({ 
    positions: [], teams: [], sprints: [],
    casual_leave_limit: 2,
    medical_leave_limit: 1,
    period_months: 2,
    working_days: [1, 2, 3, 4, 5]
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [newVal, setNewVal] = useState({ pos: "", team: "", sprint: "" });
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [updatingMember, setUpdatingMember] = useState(false);

  const ALL_PERMISSIONS = [
    { id: "manage_members", label: "Manage Members (Invite/Edit)" },
    { id: "manage_invoices", label: "Manage Invoices & Clients" },
    { id: "manage_payroll", label: "Manage Payroll & Salaries" },
    { id: "manage_tasks", label: "Manage All Tasks" },
    { id: "manage_org_settings", label: "Manage Organization Settings" },
  ];

  useEffect(() => {
    if (!isAdmin) { router.replace("/erp/dashboard"); return; }
    fetchSettings();
    fetchMembers();
  }, [isAdmin]);

  const fetchMembers = async () => {
    try {
      const res = await apiClient.get("/api/erp/members", { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setMembers(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchSettings = async () => {
    try {
      const res = await apiClient.get("/api/erp/settings", { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setSettings(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async (updated: any) => {
    setSaving(true);
    setMsg("");
    try {
      await apiClient.put("/api/erp/settings", updated, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(updated);
      setMsg("✅ Settings saved successfully");
      setTimeout(() => setMsg(""), 3000);
    } catch (e) { 
        setMsg("❌ Failed to save settings");
        console.error(e); 
    }
    finally { setSaving(false); }
  };

  const addItem = (type: 'positions' | 'teams' | 'sprints', val: string) => {
    if (!val.trim()) return;
    const key = (type === 'positions' ? 'pos' : type === 'teams' ? 'team' : 'sprint') as keyof typeof newVal;
    const updated = { ...settings, [type]: [...(settings[type] as string[]), val.trim()] };
    handleSave(updated);
    setNewVal({ ...newVal, [key]: "" });
  };

  const removeItem = (type: 'positions' | 'teams' | 'sprints', index: number) => {
    const updated = { ...settings, [type]: settings[type].filter((_, i) => i !== index) };
    handleSave(updated);
  };

  const togglePermission = (permId: string) => {
    if (!selectedMember) return;
    const current = selectedMember.permissions || [];
    const updated = current.includes(permId) 
      ? current.filter((p: string) => p !== permId)
      : [...current, permId];
    setSelectedMember({ ...selectedMember, permissions: updated });
  };

  const saveMemberPermissions = async () => {
    if (!selectedMember) return;
    setUpdatingMember(true);
    try {
      await apiClient.put(`/api/erp/members/${selectedMember.id}`, {
        permissions: selectedMember.permissions
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg(`✅ Permissions updated for ${selectedMember.name}`);
      fetchMembers(); // refresh local list
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      setMsg("❌ Failed to update member permissions");
    } finally {
      setUpdatingMember(false);
    }
  };

  if (loading) return <div style={{ color: "#888", padding: "40px" }}>Loading settings...</div>;

  const Section = ({ title, items, type, valKey, placeholder }: { 
    title: string, 
    items: string[], 
    type: 'positions' | 'teams' | 'sprints', 
    valKey: 'pos' | 'team' | 'sprint', 
    placeholder: string 
  }) => (
    <div className="erp-card" style={{ marginBottom: "24px" }}>
      <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: "#fff" }}>{title}</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
        {items.map((it: string, i: number) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#111", border: "1px solid #333", padding: "4px 10px", borderRadius: "6px" }}>
            <span style={{ fontSize: "13px", color: "#ccc" }}>{it}</span>
            <button 
              onClick={() => removeItem(type, i)}
              style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "14px", padding: 0 }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <input 
          className="erp-input" 
          style={{ flex: 1, height: "36px" }} 
          placeholder={placeholder}
          value={newVal[valKey]}
          onChange={e => setNewVal({ ...newVal, [valKey]: e.target.value })}
          onKeyDown={e => e.key === "Enter" && addItem(type, newVal[valKey])}
        />
        <button className="erp-btn erp-btn-ghost" onClick={() => addItem(type, newVal[valKey])}>Add</button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: "800px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 4px", color: "#fff" }}>Organization Settings</h1>
        <p style={{ color: "#888", margin: 0, fontSize: "14px" }}>Customize your workspace structure and team metadata.</p>
      </div>

      {msg && (
        <div style={{ 
          padding: "12px 16px", borderRadius: "10px", marginBottom: "24px", fontSize: "14px",
          background: msg.startsWith("✅") ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
          border: `1px solid ${msg.startsWith("✅") ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.3)"}`,
          color: msg.startsWith("✅") ? "#34d399" : "#f87171",
        }}>
          {msg}
        </div>
      )}

      <Section title="Company Positions" items={settings.positions} type="positions" valKey="pos" placeholder="e.g. Senior Developer" />
      <Section title="Working Teams" items={settings.teams} type="teams" valKey="team" placeholder="e.g. Backend Engine" />
      <Section title="Active Sprints" items={settings.sprints} type="sprints" valKey="sprint" placeholder="e.g. 2024-Q3-Sprint-1" />
      
      <div className="erp-card" style={{ marginTop: "24px" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: "#fff" }}>Leave & Salary Configuration</h3>
        <p style={{ fontSize: "12px", color: "#666", marginBottom: "20px" }}>Set the organization-wide limits for paid leaves and the calculation period.</p>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <label className="erp-label">Casual Leave Limit (per period)</label>
            <input 
              type="number" 
              className="erp-input" 
              value={settings.casual_leave_limit} 
              onChange={e => setSettings({ ...settings, casual_leave_limit: parseInt(e.target.value) || 0 })} 
            />
          </div>
          <div>
            <label className="erp-label">Medical Leave Limit (per period)</label>
            <input 
              type="number" 
              className="erp-input" 
              value={settings.medical_leave_limit} 
              onChange={e => setSettings({ ...settings, medical_leave_limit: parseInt(e.target.value) || 0 })} 
            />
          </div>
          <div>
            <label className="erp-label">Period Duration (Months)</label>
            <input 
              type="number" 
              className="erp-input" 
              value={settings.period_months} 
              onChange={e => setSettings({ ...settings, period_months: parseInt(e.target.value) || 0 })} 
              placeholder="e.g. 2 for bi-monthly"
            />
          </div>
        </div>

        <div style={{ padding: "20px", borderTop: "1px solid #111", marginTop: "20px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>Working Days</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => {
              const isActive = settings.working_days.includes(i);
              return (
                <button
                  key={day}
                  onClick={() => {
                    const next = isActive ? settings.working_days.filter(d => d !== i) : [...settings.working_days, i];
                    setSettings({ ...settings, working_days: next });
                  }}
                  style={{
                    padding: "8px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer",
                    background: isActive ? "#fff" : "#111",
                    border: `1px solid ${isActive ? "#fff" : "#222"}`,
                    color: isActive ? "#000" : "#888",
                    transition: "0.2s", fontWeight: 700
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <p style={{ marginTop: "12px", fontSize: "12px", color: "#555" }}>
            * Salary calculation and daily rates will be based only on these selected days.
          </p>
        </div>

        <div style={{ padding: "20px", borderTop: "1px solid #111", display: "flex", justifyContent: "flex-end" }}>
          <button className="erp-btn erp-btn-primary" onClick={() => handleSave(settings)} disabled={saving}>
            {saving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>

      <div className="erp-card" style={{ marginTop: "24px", marginBottom: "40px" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 700, color: "#fff" }}>Member Access Control</h3>
        <p style={{ fontSize: "12px", color: "#666", marginBottom: "20px" }}>Grant specific permissions to HR, Managers or other members.</p>
        
        <div style={{ marginBottom: "20px" }}>
            <label className="erp-label">Select Member</label>
            <select 
                className="erp-input"
                onChange={(e) => {
                    const m = members.find(m => m.id === e.target.value);
                    setSelectedMember(m || null);
                }}
                value={selectedMember?.id || ""}
            >
                <option value="">-- Choose a member --</option>
                {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.email}) - {m.role}</option>
                ))}
            </select>
        </div>

        {selectedMember && (
            <div style={{ padding: "20px", background: "#050505", borderRadius: "12px", border: "1px solid #222" }}>
                <h4 style={{ margin: "0 0 16px", fontSize: "14px", color: "#fff" }}>Permissions for {selectedMember.name}</h4>
                <div style={{ display: "grid", gap: "12px" }}>
                    {ALL_PERMISSIONS.map(perm => (
                        <label key={perm.id} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#ccc", fontSize: "14px" }}>
                            <input 
                                type="checkbox" 
                                checked={selectedMember.permissions?.includes(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                style={{ width: "16px", height: "16px", accentColor: "#fff" }}
                            />
                            {perm.label}
                        </label>
                    ))}
                </div>
                <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                    <button 
                        className="erp-btn erp-btn-primary" 
                        onClick={saveMemberPermissions}
                        disabled={updatingMember}
                    >
                        {updatingMember ? "Saving..." : "Update Permissions"}
                    </button>
                </div>
            </div>
        )}
      </div>
      
      {saving && <div style={{ color: "#666", fontSize: "12px", textAlign: "center" }}>Saving changes...</div>}
      
      {saving && <div style={{ color: "#666", fontSize: "12px", textAlign: "center" }}>Saving changes...</div>}
    </div>
  );
}
