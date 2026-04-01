"use client";
import React, { useEffect, useState } from "react";
import { useERPAuth, apiClient } from "@/src/components/erp/ERPAuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Invoice {
  id: string;
  client_name: string;
  invoice_number: string;
  total: number;
  status: string;
  due_date?: string;
  created_at: string;
}

export default function ERPInvoicesPage() {
  const { token, isAdmin } = useERPAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchInvoices();
  }, [token]);

  const fetchInvoices = async () => {
    try {
      const res = await apiClient.get("/api/erp/payroll/paid-invoices", { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setInvoices(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    // Note: Salary invoices (payslips) might not support status updates via the standard invoices API.
    // We'll keep this but it may need backend adjustment if salary status change is needed here.
    try {
      await apiClient.put(`/api/erp/invoices/${id}/status?status=${newStatus}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchInvoices();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await apiClient.delete(`/api/erp/invoices/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchInvoices();
    } catch (e) {
      console.error(e);
    }
  };

  const [showSendModal, setShowSendModal] = useState(false);
  const [sentInvoice, setSentInvoice] = useState<any>(null);
  const [sending, setSending] = useState(false);

  const handleSend = async (inv: Invoice) => {
    setSending(true);
    try {
      await apiClient.post(`/api/erp/invoices/${inv.id}/send`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setSentInvoice(inv);
      setShowSendModal(true);
      fetchInvoices();
    } catch (err) {
      console.error(err);
      alert("Failed to send invoice email");
    } finally {
      setSending(false);
    }
  };

  const statusColors: any = {
    draft: { bg: "rgba(100,100,100,0.2)", color: "#a0a0a0", border: "rgba(100,100,100,0.5)" },
    sent: { bg: "rgba(59,130,246,0.2)", color: "#60a5fa", border: "rgba(59,130,246,0.5)" },
    paid: { bg: "rgba(16,185,129,0.2)", color: "#34d399", border: "rgba(16,185,129,0.5)" },
    overdue: { bg: "rgba(239,68,68,0.2)", color: "#f87171", border: "rgba(239,68,68,0.5)" }
  };

  if (loading) return <div style={{ color: "#888", padding: "40px" }}>Loading invoices...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 4px", color: "#fff", letterSpacing: "-0.02em" }}>Invoices</h1>
          <p style={{ color: "#888", margin: 0, fontSize: "14px" }}>Manage and track your billing.</p>
        </div>
        <Link href="/erp/dashboard/invoices/create" className="erp-btn erp-btn-primary">
          + Create Invoice
        </Link>
      </div>

      <div className="erp-card" style={{ padding: "0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #222", background: "#111" }}>
              <th style={{ padding: "16px", color: "#888", fontWeight: 600, fontSize: "13px" }}>Invoice ID</th>
              <th style={{ padding: "16px", color: "#888", fontWeight: 600, fontSize: "13px" }}>Member</th>
              <th style={{ padding: "16px", color: "#888", fontWeight: 600, fontSize: "13px" }}>Date Created</th>
              <th style={{ padding: "16px", color: "#888", fontWeight: 600, fontSize: "13px" }}>Pay Period</th>
              <th style={{ padding: "16px", color: "#888", fontWeight: 600, fontSize: "13px" }}>Status</th>
              <th style={{ padding: "16px", color: "#888", fontWeight: 600, fontSize: "13px", textAlign: "right" }}>Amount</th>
              <th style={{ padding: "16px", color: "#888", fontWeight: 600, fontSize: "13px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "#666" }}>
                  No member invoices found.
                </td>
              </tr>
            )}
            {invoices.map(inv => {
              const sc = statusColors[inv.status] || statusColors.draft;
              return (
                <tr key={inv.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                  <td style={{ padding: "16px", fontSize: "14px", fontWeight: "bold" }}>{inv.invoice_number}</td>
                  <td style={{ padding: "16px", fontSize: "14px", color: "#fff" }}>{inv.client_name}</td>
                  <td style={{ padding: "16px", fontSize: "13px", color: "#888" }}>{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: "16px", fontSize: "13px", color: "#888" }}>{inv.due_date || "-"}</td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ 
                      padding: "4px 8px", borderRadius: "100px", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase",
                      background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`
                    }}>
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ padding: "16px", fontSize: "15px", fontWeight: "bold", color: "#34d399", textAlign: "right" }}>
                    ${inv.total.toFixed(2)}
                  </td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                     <button 
                       onClick={() => handleSend(inv)}
                       disabled={sending}
                       style={{ 
                         marginRight: "8px", background: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)",
                         padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer", transition: "opacity 0.2s"
                       }}
                       title="Send to Client Gmail"
                     >
                       {sending ? "..." : "SEND"}
                     </button>
                     <select 
                       className="erp-input erp-select" 
                       style={{ width: "auto", padding: "4px 24px 4px 8px", fontSize: "12px", height: "auto", display: "inline-block", marginRight: "8px" }}
                       value={inv.status}
                       onChange={e => updateStatus(inv.id, e.target.value)}
                       disabled={!isAdmin}
                     >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                     </select>

                     {isAdmin && (
                       <button onClick={() => handleDelete(inv.id)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontSize: "12px" }}>
                         Delete
                       </button>
                     )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Send Success Modal */}
      {showSendModal && sentInvoice && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
           <div style={{ background: "#050505", border: "1px solid #222", borderRadius: "24px", maxWidth: "480px", width: "100%", overflow: "hidden", animation: "zoomIn 0.3s ease" }}>
              <div style={{ padding: "40px", textAlign: "center" }}>
                 <div style={{ width: "64px", height: "64px", background: "#10b981", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <svg width="32" height="32" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                 </div>
                 <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.02em" }}>INVOICE SENT</h2>
                 <p style={{ color: "#888", fontSize: "14px", lineHeight: "1.6", margin: "0 0 30px" }}>
                    Invoice <strong>{sentInvoice.invoice_number}</strong> for <strong>{sentInvoice.client_name}</strong> has been successfully generated and sent to their Gmail.
                 </p>
                 <button 
                   onClick={() => setShowSendModal(false)}
                   style={{ width: "100%", padding: "14px", borderRadius: "12px", background: "#fff", color: "#000", fontWeight: 800, border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "12px" }}
                 >
                   Got it
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
