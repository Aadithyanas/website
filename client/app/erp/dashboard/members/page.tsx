"use client";
import React, { useEffect, useState } from "react";
import { useERPAuth, apiClient } from "@/src/components/erp/ERPAuthContext";
import { useRouter } from "next/navigation";

interface Member {
  id: string; name: string; email: string; phone?: string;
  position?: string; role: string; avatar?: string; registered: boolean;
}

export default function ERPMembersPage() {
  const { isAdmin, token } = useERPAuth();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", position: "" });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!isAdmin) { router.replace("/erp/dashboard"); return; }
    fetchMembers();
  }, [isAdmin, token]);

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
      await apiClient.post("/api/erp/members/invite", form, { headers: { Authorization: `Bearer ${token}` } });
      setMsg(`✅ Invite sent to ${form.email}`);
      setForm({ name: "", email: "", phone: "", position: "" });
      fetchMembers();
      setTimeout(() => setShowModal(false), 1500);
    } catch (err: any) {
      setMsg(`❌ ${err?.response?.data?.detail || "Failed to send invite"}`);
    } finally { setSubmitting(false); }
  };

  const initials = (name: string) => name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  if (loading) return <div style={{ color: "#888" }}>Loading members...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px", color: "#fff" }}>Team Members</h1>
          <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>{members.length} members total</p>
        </div>
        <button className="erp-btn erp-btn-primary" onClick={() => setShowModal(true)}>
          + Invite Member
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
        {members.map(m => (
          <div key={m.id} className="erp-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {m.avatar ? (
                <img src={m.avatar} alt={m.name} style={{ width: "48px", height: "48px", borderRadius: "9999px" }} />
              ) : (
                <div className="erp-avatar">{initials(m.name)}</div>
              )}
              <div style={{ flex: 1, overflow: "hidden" }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: "15px", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.email}</p>
              </div>
              <span className={`erp-badge erp-badge-${m.role}`}>{m.role}</span>
            </div>
            {m.position && <p style={{ margin: 0, fontSize: "13px", color: "#a78bfa", padding: "6px 10px", background: "rgba(167,139,250,0.08)", borderRadius: "8px" }}>{m.position}</p>}
            {m.phone && <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>📞 {m.phone}</p>}
            {!m.registered && (
              <span style={{ fontSize: "12px", color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "6px", padding: "4px 8px", textAlign: "center" }}>
                ⏳ Invite Pending
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {showModal && (
        <div className="erp-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="erp-modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 20px", fontSize: "20px", fontWeight: 700, color: "#fff" }}>Invite New Member</h2>
            {msg && (
              <div style={{
                padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px",
                background: msg.startsWith("✅") ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${msg.startsWith("✅") ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.3)"}`,
                color: msg.startsWith("✅") ? "#34d399" : "#f87171",
              }}>{msg}</div>
            )}
            <form onSubmit={handleInvite} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="erp-label">Full Name *</label>
                <input className="erp-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" required />
              </div>
              <div>
                <label className="erp-label">Email *</label>
                <input className="erp-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" required />
              </div>
              <div>
                <label className="erp-label">Phone</label>
                <input className="erp-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="erp-label">Position</label>
                <input className="erp-input" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} placeholder="e.g. Frontend Developer" />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="button" className="erp-btn erp-btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="erp-btn erp-btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? "Sending..." : "Send Invite 📧"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
