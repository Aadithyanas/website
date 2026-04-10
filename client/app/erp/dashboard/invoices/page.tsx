"use client";
import React, { useEffect, useState } from "react";
import { useERPAuth, apiClient } from "@/src/components/erp/ERPAuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";

interface Invoice {
  id: string;
  client_name: string;
  invoice_number: string;
  total: number;
  status: string;
  due_date?: string;
  created_at: string;
  is_salary?: boolean;
}

export default function ERPInvoicesPage() {
  const { token, isAdmin, hasPermission } = useERPAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"clients" | "salary">("clients");

  useEffect(() => {
    if (token) fetchInvoices();
  }, [token, activeTab]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === "clients" ? "/api/erp/invoices" : "/api/erp/payroll/paid-invoices";
      const res = await apiClient.get(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      setInvoices(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
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

  const sendInvoice = async (id: string) => {
    if (!confirm("Send this invoice to the client's email?")) return;
    try {
      await apiClient.post(`/api/erp/invoices/${id}/send`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert("✅ Invoice sent successfully!");
      fetchInvoices();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.detail || "Failed to send invoice");
    }
  };

  const downloadPDF = async (inv: Invoice) => {
    const doc = new jsPDF();
    const isSalary = activeTab === "salary" || inv.is_salary;

    // Header - Brand
    doc.setFontSize(22);
    doc.setTextColor(124, 58, 237); // Indigo 600
    doc.text("COMPANY ERP", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Organization Management System", 14, 25);

    // Invoice Info
    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text(isSalary ? "SALARY PAYSLIP" : "INVOICE", 14, 45);
    
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`Number: ${inv.invoice_number}`, 14, 52);
    doc.text(`Date: ${new Date(inv.created_at).toLocaleDateString()}`, 14, 57);
    if (!isSalary && inv.due_date) doc.text(`Due Date: ${inv.due_date}`, 14, 62);

    // To / Recipient
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(isSalary ? "Employee Info:" : "Bill To:", 14, 75);
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(inv.client_name, 14, 82);
    
    // Table
    const tableColumn = isSalary ? ["Description", "Period", "Amount"] : ["Description", "Quantity", "Price", "Total"];
    const tableRows = isSalary ? [
      ["Professional Services / Salary", inv.due_date || "N/A", `$${inv.total.toFixed(2)}`]
    ] : [
      ["Professional Services", "1", `$${inv.total.toFixed(2)}`, `$${inv.total.toFixed(2)}`]
    ];

    autoTable(doc, {
      startY: 95,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [124, 58, 237] },
      margin: { left: 14, right: 14 }
    });

    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`TOTAL AMOUNT: $${inv.total.toFixed(2)}`, 140, finalY + 10);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Thank you for your business!", 14, finalY + 30);

    doc.save(`${inv.invoice_number}.pdf`);
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
        {(isAdmin || hasPermission("manage_invoices")) && (
          <Link href="/erp/dashboard/invoices/create" className="erp-btn erp-btn-primary">
            + Create Invoice
          </Link>
        )}
      </div>

      <div style={{ display: "flex", gap: "20px", marginBottom: "20px", borderBottom: "1px solid #222" }}>
        <button 
          onClick={() => setActiveTab("clients")}
          style={{ 
            padding: "12px 4px", background: "none", border: "none", borderBottom: activeTab === "clients" ? "2px solid #a78bfa" : "2px solid transparent",
            color: activeTab === "clients" ? "#fff" : "#666", fontWeight: activeTab === "clients" ? 700 : 500, cursor: "pointer", fontSize: "14px"
          }}
        >
          Client Invoices
        </button>
        <button 
          onClick={() => setActiveTab("salary")}
          style={{ 
            padding: "12px 4px", background: "none", border: "none", borderBottom: activeTab === "salary" ? "2px solid #a78bfa" : "2px solid transparent",
            color: activeTab === "salary" ? "#fff" : "#666", fontWeight: activeTab === "salary" ? 700 : 500, cursor: "pointer", fontSize: "14px"
          }}
        >
          Salary Payslips (Paid)
        </button>
      </div>

      <div className="erp-card" style={{ padding: "0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #222", background: "#111" }}>
              <th style={{ padding: "16px", color: "#888", fontWeight: 600, fontSize: "13px" }}>Invoice ID</th>
              <th style={{ padding: "16px", color: "#888", fontWeight: 600, fontSize: "13px" }}>{activeTab === "clients" ? "Client" : "Member"}</th>
              <th style={{ padding: "16px", color: "#888", fontWeight: 600, fontSize: "13px" }}>{activeTab === "clients" ? "Date Created" : "Date Paid"}</th>
              <th style={{ padding: "16px", color: "#888", fontWeight: 600, fontSize: "13px" }}>{activeTab === "clients" ? "Due Date" : "Period"}</th>
              <th style={{ padding: "16px", color: "#888", fontWeight: 600, fontSize: "13px" }}>Status</th>
              <th style={{ padding: "16px", color: "#888", fontWeight: 600, fontSize: "13px", textAlign: "right" }}>Total</th>
              <th style={{ padding: "16px", color: "#888", fontWeight: 600, fontSize: "13px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "#666" }}>
                  No invoices created yet.
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
                      {activeTab === "clients" ? (
                        <>
                          <select 
                            className="erp-input erp-select" 
                            style={{ width: "auto", padding: "4px 24px 4px 8px", fontSize: "12px", height: "auto", display: "inline-block", marginRight: "8px" }}
                            value={inv.status}
                            onChange={e => updateStatus(inv.id, e.target.value)}
                            disabled={!isAdmin && !hasPermission("manage_invoices")}
                          >
                             <option value="draft">Draft</option>
                             <option value="sent">Sent</option>
                             <option value="paid">Paid</option>
                             <option value="overdue">Overdue</option>
                          </select>

                          {(isAdmin || hasPermission("manage_invoices")) && (
                            <>
                              <button 
                                onClick={() => sendInvoice(inv.id)} 
                                style={{ color: "#a78bfa", background: "none", border: "none", cursor: "pointer", fontSize: "12px", marginRight: "8px" }}
                                title="Send to client email"
                              >
                                Email
                              </button>
                              <button onClick={() => handleDelete(inv.id)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontSize: "12px" }}>
                                Delete
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => downloadPDF(inv)} 
                            style={{ color: "#34d399", background: "none", border: "none", cursor: "pointer", fontSize: "12px", marginLeft: "8px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          >
                            <Download size={14} /> PDF
                          </button>
                        </>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                           <span style={{ fontSize: "12px", color: "#666" }}>Paid Payroll Record</span>
                           <button 
                            onClick={() => downloadPDF(inv)} 
                            style={{ color: "#34d399", background: "none", border: "none", cursor: "pointer", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          >
                            <Download size={14} /> PDF
                          </button>
                        </div>
                      )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
