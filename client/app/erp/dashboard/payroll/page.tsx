"use client";
import React, { useEffect, useState } from "react";
import { useERPAuth, apiClient } from "@/src/components/erp/ERPAuthContext";
import { useRouter } from "next/navigation";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, parseISO } from "date-fns";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PayrollMember {
  member_id: string;
  member_name: string;
  member_email: string;
  avatar?: string;
  base_salary: number;
  net_salary: number;
  status: "paid" | "unpaid";
  leaves_count: number;
}

export default function ERPPayrollPage() {
  const { isAdmin, token, user: currentUser } = useERPAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payrollData, setPayrollData] = useState<PayrollMember[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<PayrollMember | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // For the detail modal
  const [memberSalaryReport, setMemberSalaryReport] = useState<any>(null);
  const [memberLeaves, setMemberLeaves] = useState<any[]>([]);

  useEffect(() => {
    // Load Razorpay Script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/erp/dashboard");
      return;
    }
    fetchPayroll();
  }, [isAdmin, token, month, year]);

  useEffect(() => {
    const handleUpdate = () => {
      console.log("Real-time Payroll Update (via Leave) Detected");
      fetchPayroll();
    };
    window.addEventListener("erp:leave_update" as any, handleUpdate);
    return () => window.removeEventListener("erp:leave_update" as any, handleUpdate);
  }, [token]);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/erp/payroll/summary?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayrollData(res.data);
    } catch (e) {
      console.error("Failed to fetch payroll", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (memberId: string, currentStatus: string) => {
    const newStatus = currentStatus === "paid" ? "unpaid" : "paid";
    try {
      await apiClient.put(`/api/erp/payroll/status/${memberId}?month=${month}&year=${year}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Optimistic update
      setPayrollData(prev => prev.map(m => m.member_id === memberId ? { ...m, status: newStatus as any } : m));
    } catch (e) {
      console.error("Failed to update status", e);
      alert("Failed to update status");
    }
  };

  const handleRazorpayPayment = async (member: PayrollMember) => {
    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded. Please wait.");
      return;
    }

    setProcessingPayment(true);
    try {
      // 1. Create Order
      const orderRes = await apiClient.post(
        `/api/erp/payroll/razorpay/order/${member.member_id}?month=${month}&year=${year}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const order = orderRes.data;

      // 2. Open Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YOUR_KEY_ID",
        amount: order.amount,
        currency: order.currency,
        name: "ERP System",
        description: `Salary Payment for ${member.member_name} (${format(new Date(year, month - 1), "MMM yyyy")})`,
        order_id: order.id,
        handler: async (response: any) => {
          // 3. Verify Payment
          try {
            await apiClient.post("/api/erp/payroll/razorpay/verify", {
              ...response,
              member_id: member.member_id,
              month,
              year
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            alert("Payment successful!");
            fetchPayroll();
            setShowModal(false);
          } catch (err) {
            console.error(err);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: member.member_name,
          email: member.member_email,
        },
        theme: {
          color: "#7c3aed",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to initiate payment");
    } finally {
      setProcessingPayment(false);
    }
  };

  const openMemberDetail = async (member: PayrollMember) => {
    setSelectedMember(member);
    setShowModal(true);
    setMemberSalaryReport(null);
    setMemberLeaves([]);
    
    try {
      // Fetch specific salary report
      const sr = await apiClient.get(`/api/erp/salary/report/${member.member_id}?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMemberSalaryReport(sr.data);

      const attres = await apiClient.get(`/api/erp/attendance/calendar/${member.member_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const month_start = `${year}-${month.toString().padStart(2, '0')}-01`;
      const last_day = new Date(year, month, 0).getDate();
      const month_end = `${year}-${month.toString().padStart(2, '0')}-${last_day}`;

      const filtered = attres.data.filter((l: any) => {
        return l.date >= month_start && l.date <= month_end && l.status === "approved";
      });
      setMemberLeaves(filtered);
    } catch (e) {
      console.error("Failed to fetch member details", e);
    }
  };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = [2024, 2025, 2026];

  if (!isAdmin) return null;

  return (
    <div style={{ color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Payroll Management</h1>
          <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>Track monthly salaries and payment statuses for all members.</p>
        </div>
        
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => fetchPayroll()} className="erp-btn erp-btn-ghost" style={{ padding: "8px 12px" }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
          <div className="erp-card" style={{ padding: "12px 20px", background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.1)", minWidth: "200px" }}>
            <div style={{ fontSize: "11px", color: "#34d399", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>Total Monthly Payout</div>
            <div style={{ fontSize: "20px", fontWeight: 900, color: "#fff" }}>
              ${payrollData.reduce((acc, curr) => acc + curr.net_salary, 0).toLocaleString()}
            </div>
          </div>
          <select 
            value={month} 
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="erp-input erp-select"
            style={{ width: "140px", padding: "8px 12px" }}
          >
            {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select 
            value={year} 
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="erp-input erp-select"
            style={{ width: "100px", padding: "8px 12px" }}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="erp-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #111", background: "rgba(255,255,255,0.02)", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", fontSize: "12px", fontWeight: 700, color: "#666", textTransform: "uppercase" }}>
          <span>Member</span>
          <span>Base Salary</span>
          <span>Net Salary</span>
          <span>Leaves</span>
          <span style={{ textAlign: "right" }}>Status</span>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>Loading payroll data...</div>
        ) : payrollData.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>No members found.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {payrollData.map((m) => (
              <div 
                key={m.member_id}
                onClick={() => openMemberDetail(m)}
                style={{ 
                  display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", 
                  padding: "16px 24px", borderBottom: "1px solid #111", 
                  alignItems: "center", cursor: "pointer", transition: "0.2s"
                }}
                className="erp-list-row"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {m.avatar ? (
                    <img src={m.avatar} style={{ width: "32px", height: "32px", borderRadius: "50%" }} />
                  ) : (
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, border: "1px solid #222" }}>
                      {m.member_name[0]}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700 }}>{m.member_name}</div>
                    <div style={{ fontSize: "11px", color: "#666" }}>{m.member_email}</div>
                  </div>
                </div>
                
                <div style={{ fontSize: "14px", fontWeight: 500, color: "#888" }}>${m.base_salary.toLocaleString()}</div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#34d399" }}>${m.net_salary.toLocaleString()}</div>
                <div style={{ fontSize: "14px", color: m.leaves_count > 0 ? "#fbbf24" : "#666" }}>
                  {m.leaves_count} {m.leaves_count === 1 ? "day" : "days"}
                </div>
                
                <div style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    {m.status === "unpaid" && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRazorpayPayment(m); }}
                        className="erp-btn erp-btn-primary"
                        style={{ padding: "4px 8px", fontSize: "10px", height: "auto" }}
                      >
                        PAY
                      </button>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleStatus(m.member_id, m.status); }}
                      style={{
                        padding: "4px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 800,
                        cursor: "pointer", transition: "0.2s",
                        background: m.status === "paid" ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
                        border: `1px solid ${m.status === "paid" ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.3)"}`,
                        color: m.status === "paid" ? "#34d399" : "#f87171",
                        textTransform: "uppercase"
                      }}
                    >
                      {m.status}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && selectedMember && (
        <div className="erp-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="erp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: "800px", width: "95%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 800, border: "1px solid #222" }}>
                    {selectedMember.member_name[0]}
                  </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>{selectedMember.member_name}</h2>
                  <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>{months[month-1]} {year} Payroll Details</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div className="erp-card" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid #111" }}>
                <h3 style={{ fontSize: "12px", fontWeight: 700, margin: "0 0 16px", color: "#666", textTransform: "uppercase" }}>Financial Summary</h3>
                {memberSalaryReport ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#666" }}>Base Salary</span><span style={{ fontWeight: 700 }}>${memberSalaryReport.base_salary.toLocaleString()}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#666" }}>Working Days</span><span style={{ fontWeight: 700 }}>{memberSalaryReport.working_days_count} days</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#666" }}>Daily Rate</span><span>${memberSalaryReport.daily_rate}</span></div>
                    <div style={{ height: "1px", background: "#222", margin: "4px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#666" }}>Deductions</span><span style={{ color: "#f87171" }}>-${memberSalaryReport.deductions.toLocaleString()}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", background: "rgba(52,211,153,0.05)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(52,211,153,0.1)" }}>
                      <span style={{ fontWeight: 700, color: "#34d399" }}>NET SALARY</span>
                      <span style={{ fontWeight: 900, color: "#34d399", fontSize: "18px" }}>${memberSalaryReport.net_salary.toLocaleString()}</span>
                    </div>
                  </div>
                ) : <div>Loading...</div>}
              </div>

              <div className="erp-card" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid #111" }}>
                <h3 style={{ fontSize: "12px", fontWeight: 700, margin: "0 0 16px", color: "#666", textTransform: "uppercase" }}>Attendance</h3>
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {memberLeaves.length === 0 ? <p style={{ color: "#444", fontSize: "12px" }}>No leaves this month.</p> : (
                    memberLeaves.map((l: any, i: number) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #111", fontSize: "12px" }}>
                        <span style={{ color: "#888" }}>{l.date}</span>
                        <span style={{ fontWeight: 700, color: "#a78bfa" }}>{l.leave_type.toUpperCase()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
               <button onClick={() => setShowModal(false)} className="erp-btn erp-btn-ghost">Close</button>
               {selectedMember.status === "unpaid" && (
                 <button 
                  disabled={processingPayment}
                  onClick={() => handleRazorpayPayment(selectedMember)} 
                  className="erp-btn erp-btn-primary"
                  style={{ background: "#7c3aed", borderColor: "#7c3aed" }}
                 >
                   {processingPayment ? "Processing..." : "Pay with Razorpay"}
                 </button>
               )}
               <button 
                  onClick={() => { toggleStatus(selectedMember.member_id, selectedMember.status); setShowModal(false); }}
                  className="erp-btn erp-btn-ghost"
                  style={{ color: selectedMember.status === "paid" ? "#f87171" : "#34d399" }}
               >
                 Mark {selectedMember.status === "paid" ? "Unpaid" : "Paid"}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
