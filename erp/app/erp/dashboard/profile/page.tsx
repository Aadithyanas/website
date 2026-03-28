"use client";
import React, { useState } from "react";
import { useERPAuth, apiClient } from "@/src/components/erp/ERPAuthContext";

export default function ERPProfilePage() {
  const { user, token, setTokenAndUser } = useERPAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    position: user?.position || "",
    avatar: user?.avatar || "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const res = await apiClient.put(`/api/erp/members/${user?.id}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTokenAndUser(token!, res.data);
      setMsg("✅ Profile updated successfully!");
    } catch (err: any) {
      setMsg("❌ Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>My Profile</h1>
      <p style={{ color: "#888", marginBottom: "32px" }}>Manage your personal information and organization details.</p>

      <div className="erp-card">
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px", borderBottom: "1px solid #111", paddingBottom: "24px" }}>
          <div className="erp-avatar" style={{ width: "80px", height: "80px", fontSize: "24px" }}>
            {user?.avatar ? <img src={user.avatar} alt={user?.name || "User Avatar"} style={{ borderRadius: "50%" }} /> : user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, color: "#fff", fontSize: "18px" }}>{user?.name}</h2>
            <p style={{ margin: "4px 0", color: "#666", fontSize: "14px" }}>{user?.email}</p>
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <span className={`erp-badge erp-badge-${user?.role}`}>{user?.role}</span>
              {user?.org_name && <span className="erp-badge" style={{ background: "#222", border: "1px solid #333", color: "#fff" }}>{user.org_name}</span>}
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {msg && <div style={{ padding: "12px", borderRadius: "8px", background: msg.startsWith("✅") ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)", border: "1px solid rgba(255,255,255,0.05)", color: msg.startsWith("✅") ? "#34d399" : "#f87171", fontSize: "14px" }}>{msg}</div>}
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label className="erp-label">Full Name</label>
              <input className="erp-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="erp-label">Phone Number</label>
              <input className="erp-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="erp-label">Position</label>
            <input className="erp-input" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} />
          </div>

          <div>
            <label className="erp-label">Avatar URL</label>
            <input className="erp-input" value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} placeholder="https://..." />
          </div>

          <div style={{ marginTop: "12px" }}>
            <button className="erp-btn erp-btn-primary" disabled={saving} style={{ padding: "12px 24px" }}>
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <div className="erp-card" style={{ marginTop: "24px", border: "1px solid #1a1a1a" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: "14px", color: "#666", textTransform: "uppercase", letterSpacing: "0.05em" }}>Organization Info</h3>
        <p style={{ margin: 0, color: "#fff", fontWeight: 600 }}>{user?.org_name || "Personal Workspace"}</p>
        <p style={{ margin: "4px 0 0", color: "#444", fontSize: "12px" }}>ID: {user?.org_id}</p>
      </div>
    </div>
  );
}
