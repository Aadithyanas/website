"use client";
import React, { useEffect, useState } from "react";
import { useERPAuth, apiClient } from "@/src/components/erp/ERPAuthContext";
import { useRouter } from "next/navigation";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  created_at: string;
}

export default function ERPClientsPage() {
  const { token, isAdmin, hasPermission } = useERPAuth();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", company: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (token) fetchClients();
  }, [token]);

  const fetchClients = async () => {
    try {
      const res = await apiClient.get("/api/erp/clients", { headers: { Authorization: `Bearer ${token}` } });
      setClients(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editClient) {
        await apiClient.put(`/api/erp/clients/${editClient.id}`, form, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await apiClient.post("/api/erp/clients", form, { headers: { Authorization: `Bearer ${token}` } });
      }
      fetchClients();
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to save client");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    try {
      await apiClient.delete(`/api/erp/clients/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchClients();
    } catch (e) {
      console.error(e);
      alert("Failed to delete client");
    }
  };

  const openEdit = (c: Client) => {
    setEditClient(c);
    setForm({
      name: c.name,
      email: c.email || "",
      phone: c.phone || "",
      address: c.address || "",
      company: c.company || ""
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditClient(null);
    setForm({ name: "", email: "", phone: "", address: "", company: "" });
  };

  if (loading) return <div style={{ color: "#888", padding: "40px" }}>Loading clients...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 4px", color: "#fff", letterSpacing: "-0.02em" }}>Clients Directory</h1>
          <p style={{ color: "#888", margin: 0, fontSize: "14px" }}>Manage your external clients and contacts.</p>
        </div>
        {(isAdmin || hasPermission("manage_invoices")) && (
          <button className="erp-btn erp-btn-primary" onClick={() => setShowModal(true)}>
            + Add Client
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        {clients.length === 0 && <div style={{ color: "#666" }}>No clients found. Add your first client to start billing!</div>}
        {clients.map(c => (
          <div key={c.id} className="erp-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: "18px", color: "#fff" }}>{c.name}</h3>
                {c.company && <p style={{ margin: 0, fontSize: "14px", color: "#a78bfa" }}>{c.company}</p>}
              </div>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", color: "#666", fontWeight: "bold" }}>
                {c.name.substring(0, 2).toUpperCase()}
              </div>
            </div>

            <div style={{ background: "#0a0a0a", padding: "12px", borderRadius: "8px", border: "1px solid #111", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "#888" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ width: "20px" }}>✉️</span> {c.email || "No email"}
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ width: "20px" }}>📞</span> {c.phone || "No phone"}
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ width: "20px" }}>📍</span> {c.address || "No address"}
              </div>
            </div>

            {(isAdmin || hasPermission("manage_invoices")) && (
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "auto", paddingTop: "12px", borderTop: "1px solid #111" }}>
                <button onClick={() => openEdit(c)} className="erp-btn erp-btn-ghost" style={{ padding: "6px 12px", fontSize: "12px" }}>Edit</button>
                <button onClick={() => handleDelete(c.id)} className="erp-btn" style={{ padding: "6px 12px", fontSize: "12px", background: "#330000", color: "#ff4d4d", border: "1px solid #4d0000" }}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="erp-modal-overlay" onClick={closeModal}>
          <div className="erp-modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 24px", fontSize: "20px", fontWeight: 800 }}>{editClient ? "Edit Client" : "Add New Client"}</h2>
            
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="erp-label">Client Name *</label>
                <input className="erp-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="erp-label">Company Name</label>
                <input className="erp-input" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label className="erp-label">Email</label>
                  <input className="erp-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="erp-label">Phone</label>
                  <input className="erp-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="erp-label">Billing Address</label>
                <textarea className="erp-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={3} />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="button" className="erp-btn erp-btn-ghost" style={{ flex: 1 }} onClick={closeModal}>Cancel</button>
                <button type="submit" className="erp-btn erp-btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? "Saving..." : (editClient ? "Save Changes" : "Create Client")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
