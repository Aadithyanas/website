"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useERPAuth, apiClient } from "@/src/components/erp/ERPAuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, PlusCircle } from "lucide-react";

interface Client { id: string; name: string; email?: string; company?: string; }
interface LineItem { id: string; description: string; quantity: number; price: number; }

export default function ERPCreateInvoicePage() {
  const { token } = useERPAuth();
  const router = useRouter();

  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const [memberId, setMemberId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState(0);

  const [items, setItems] = useState<LineItem[]>([
    { id: "1", description: "", quantity: 1, price: 0 }
  ]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (token) fetchMembers();
  }, [token]);

  const fetchMembers = async () => {
    try {
      const res = await apiClient.get("/api/erp/members", { headers: { Authorization: `Bearer ${token}` } });
      setMembers(res.data);
      if (res.data.length > 0) setMemberId(res.data[0].id);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoadingMembers(false); 
    }
  };

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), description: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const { subtotal, taxAmount, total } = useMemo(() => {
    const sub = items.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
    const tax = sub * (taxRate / 100);
    return { subtotal: sub, taxAmount: tax, total: sub + tax };
  }, [items, taxRate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) return alert("Please select a member.");
    if (items.some(i => !i.description.trim())) return alert("All items must have a description.");

    setSubmitting(true);
    try {
      const payload = {
        client_id: memberId,
        invoice_number: invoiceNumber,
        due_date: dueDate || undefined,
        status: "draft",
        items: items.map(({ id, ...rest }) => ({ ...rest, total: rest.quantity * rest.price })),
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total
      };

      await apiClient.post("/api/erp/invoices", payload, { headers: { Authorization: `Bearer ${token}` } });
      router.push("/erp/dashboard/invoices");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.detail || "Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingMembers) return <div style={{ color: "#888", padding: "40px" }}>Loading data...</div>;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "28px" }}>
        <Link href="/erp/dashboard/invoices" className="erp-btn erp-btn-ghost" style={{ padding: "8px" }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 4px", color: "#fff" }}>Create Member Invoice</h1>
          <p style={{ color: "#888", margin: 0, fontSize: "14px" }}>Build a new invoice for an organization member.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="erp-card" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Top Header Information */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div>
            <label className="erp-label">Select Member *</label>
            {members.length === 0 ? (
              <div style={{ color: "#f87171", fontSize: "13px", padding: "8px", background: "rgba(239,68,68,0.1)", borderRadius: "8px" }}>
                No members found in organization.
              </div>
            ) : (
              <select className="erp-input erp-select" value={memberId} onChange={e => setMemberId(e.target.value)} required>
                {members.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.name} {m.position ? `(${m.position})` : ""}</option>
                ))}
              </select>
            )}
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label className="erp-label">Invoice #</label>
              <input className="erp-input" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} required />
            </div>
            <div>
              <label className="erp-label">Due Date</label>
              <input className="erp-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>
        </div>

        <hr style={{ borderColor: "#222", margin: "8px 0" }} />

        {/* Line Items */}
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr 40px", gap: "12px", marginBottom: "12px", color: "#888", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase" }}>
            <div>Description</div>
            <div>Qty</div>
            <div>Price ($)</div>
            <div>Amount ($)</div>
            <div></div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {items.map((item, index) => (
              <div key={item.id} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr 40px", gap: "12px", alignItems: "center" }}>
                <input 
                  className="erp-input" 
                  placeholder="Service description..." 
                  value={item.description} 
                  onChange={e => updateItem(item.id, "description", e.target.value)} 
                  required 
                />
                <input 
                  className="erp-input" 
                  type="number" 
                  min="1" 
                  step="0.01" 
                  value={item.quantity} 
                  onChange={e => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)} 
                  required 
                />
                <input 
                  className="erp-input" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={item.price} 
                  onChange={e => updateItem(item.id, "price", parseFloat(e.target.value) || 0)} 
                  required 
                />
                <div style={{ padding: "10px", background: "#111", borderRadius: "8px", fontWeight: "bold", color: "#ccc", display: "flex", alignItems: "center", border: "1px solid #222" }}>
                  ${(item.quantity * item.price).toFixed(2)}
                </div>
                <button 
                  type="button" 
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", background: "#220000", color: items.length === 1 ? "#666" : "#ff4d4d", borderRadius: "8px", border: "1px solid #440000", cursor: items.length === 1 ? "not-allowed" : "pointer" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button 
            type="button" 
            onClick={addItem} 
            className="erp-btn erp-btn-ghost" 
            style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}
          >
            <PlusCircle size={16} /> Add Line Item
          </button>
        </div>

        <hr style={{ borderColor: "#222", margin: "8px 0" }} />

        {/* Totals Box */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: "300px", background: "#0a0a0a", borderRadius: "12px", border: "1px solid #222", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#888", fontSize: "14px" }}>
              <span>Subtotal</span>
              <span style={{ color: "#fff" }}>${subtotal.toFixed(2)}</span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#888", fontSize: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>Tax (%)</span>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  value={taxRate} 
                  onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="erp-input" 
                  style={{ width: "60px", padding: "4px 8px", fontSize: "12px", height: "30px" }}
                />
              </div>
              <span style={{ color: "#fff" }}>${taxAmount.toFixed(2)}</span>
            </div>

            <hr style={{ borderColor: "#222" }} />
            
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "20px", fontWeight: "900", color: "#34d399", alignItems: "center" }}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Submit Container */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
          <button 
            type="submit" 
            className="erp-btn erp-btn-primary" 
            disabled={submitting || members.length === 0}
            style={{ width: "100%", maxWidth: "300px", fontSize: "16px", padding: "14px" }}
          >
            {submitting ? "Saving Invoice..." : "Save Invoice"}
          </button>
        </div>

      </form>
    </div>
  );
}
