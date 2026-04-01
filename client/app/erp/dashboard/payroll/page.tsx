"use client";
import React, { useEffect, useState } from "react";
import { useERPAuth, apiClient } from "@/src/components/erp/ERPAuthContext";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Receipt, RefreshCcw, Calendar, CheckCircle2, XCircle, CreditCard, Clock, Calculator, HelpCircle } from "lucide-react";

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
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
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

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successPaymentData, setSuccessPaymentData] = useState<any>(null);

  const handleRazorpayPayment = async (member: PayrollMember) => {
    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded. Please wait.");
      return;
    }

    setProcessingPayment(true);
    try {
      const orderRes = await apiClient.post(
        `/api/erp/payroll/razorpay/order/${member.member_id}?month=${month}&year=${year}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const order = orderRes.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YOUR_KEY_ID",
        amount: order.amount,
        currency: order.currency,
        name: "ERP System",
        description: `Salary Payment for ${member.member_name} (${format(new Date(year, month - 1), "MMM yyyy")})`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await apiClient.post("/api/erp/payroll/razorpay/verify", {
              ...response,
              member_id: member.member_id,
              month,
              year
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            // Set success data for modal
            const reportRes = await apiClient.get(`/api/erp/salary/report/${member.member_id}?month=${month}&year=${year}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            setSuccessPaymentData({
              member,
              report: reportRes.data,
              payment_id: response.razorpay_payment_id
            });
            
            setShowSuccessModal(true);
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
          color: "#7c3aed", // Indigo 600
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
  const years = [2024, 2025, 2026, 2027];

  if (!isAdmin) return null;

  return (
    <div className="w-full text-white">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-8 border-b border-[#1a1a1a] pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold m-0 mb-2 tracking-tight flex items-center gap-3">
            <Receipt className="text-indigo-500" size={28} />
            Payroll Management
          </h1>
          <p className="text-gray-400 text-sm m-0">Review monthly salaries, deductions, and payment records.</p>
        </div>
        
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto">
          {/* Total Payout Widget */}
          <div className="flex-1 lg:flex-none flex items-center justify-between gap-4 px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 w-full lg:w-auto shadow-inner">
            <div className="flex flex-col">
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest mb-0.5">Total Payout</span>
              <span className="text-lg font-black text-white">
                ₹{payrollData.reduce((acc, curr) => acc + curr.net_salary, 0).toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-1 lg:flex-none max-w-full">
            <div className="relative flex-1 lg:flex-none min-w-[120px]">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <select 
                value={month} 
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full bg-[#111] hover:bg-[#161616] border border-[#222] transition-colors text-white text-sm font-semibold rounded-xl py-2.5 pl-9 pr-8 appearance-none cursor-pointer outline-none focus:border-indigo-500"
              >
                {months.map((m, i) => <option key={m} value={i + 1} className="bg-black">{m}</option>)}
              </select>
            </div>
            
            <select 
              value={year} 
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-24 bg-[#111] hover:bg-[#161616] border border-[#222] transition-colors text-white text-sm font-semibold rounded-xl py-2.5 px-4 appearance-none cursor-pointer outline-none focus:border-indigo-500"
            >
              {years.map(y => <option key={y} value={y} className="bg-black">{y}</option>)}
            </select>
            
            <button 
              onClick={() => fetchPayroll()} 
              className="p-2.5 rounded-xl bg-[#111] hover:bg-[#222] border border-[#222] hover:border-[#333] transition-colors text-gray-400 hover:text-white group flex-shrink-0"
              title="Refresh Data"
            >
              <RefreshCcw size={16} className={`group-active:-rotate-180 transition-transform duration-500 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#050505] border border-[#111] rounded-2xl overflow-hidden shadow-2xl">
        {/* Desktop Header */}
        <div className="hidden md:grid grid-cols-[minmax(200px,2fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(100px,1fr)_minmax(150px,1.5fr)] px-6 py-4 border-b border-[#111] bg-[#0a0a0a] text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">
          <span>Member Profile</span>
          <span>Base Salary</span>
          <span>Net Salary</span>
          <span>Leaves</span>
          <span className="text-right">Action / Status</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <div className="w-8 h-8 rounded-full border-2 border-[#222] border-t-indigo-500 animate-spin mb-4" />
            <span className="text-sm font-semibold">Calculating payroll data...</span>
          </div>
        ) : payrollData.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm font-semibold flex flex-col items-center justify-center bg-[#0a0a0a]">
            <HelpCircle size={32} className="mb-3 opacity-20" />
            No members found for this pay period.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[#111]">
            {payrollData.map((m) => (
              <div 
                key={m.member_id}
                onClick={() => openMemberDetail(m)}
                className="flex flex-col md:grid md:grid-cols-[minmax(200px,2fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(100px,1fr)_minmax(150px,1.5fr)] px-5 py-4 items-center gap-4 md:gap-0 bg-[#000] hover:bg-[#0a0a0a] cursor-pointer transition-colors"
                title="Click to view full breakdown"
              >
                {/* Member Info */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                  <div className="flex items-center gap-3">
                    {m.avatar ? (
                      <img src={m.avatar} alt={m.member_name} className="w-10 h-10 rounded-full object-cover border border-[#222]" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-black shadow-inner shrink-0">
                        {m.member_name[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white tracking-wide">{m.member_name}</span>
                      <span className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">{m.member_email}</span>
                    </div>
                  </div>
                  {/* Mobile Only Net Salary Badge */}
                  <div className="md:hidden">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-black">
                      ₹{m.net_salary.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {/* Salary Info (Hidden on Mobile) */}
                <div className="hidden md:block text-sm font-bold text-gray-400">₹{m.base_salary.toLocaleString()}</div>
                <div className="hidden md:block text-sm font-black text-emerald-400">₹{m.net_salary.toLocaleString()}</div>
                
                {/* Leaves Info */}
                <div className="w-full md:w-auto flex justify-between md:justify-start items-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest md:hidden">Leaves</span>
                  <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${m.leaves_count > 0 ? "text-amber-400 bg-amber-500/10 border-amber-500/30" : "text-gray-400 bg-[#111] border-[#222]"}`}>
                    <Clock size={12} />
                    {m.leaves_count} {m.leaves_count === 1 ? "day" : "days"}
                  </div>
                </div>
                
                {/* Actions & Status */}
                <div className="w-full md:w-auto flex justify-between md:justify-end items-center gap-2 border-t border-[#111] pt-4 mt-2 md:border-t-0 md:pt-0 md:mt-0">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest md:hidden">Pay Status</span>
                  <div className="flex justify-end gap-2">
                    {m.status === "unpaid" && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRazorpayPayment(m); }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg border border-indigo-500 hover:border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-colors flex items-center gap-1.5 active:scale-95 z-10"
                      >
                        <CreditCard size={12} /> PAY
                      </button>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleStatus(m.member_id, m.status); }}
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 active:scale-95 z-10 ${
                        m.status === "paid" 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20" 
                          : "bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20"
                      }`}
                      title={`Click to mark as ${m.status === "paid" ? "unpaid" : "paid"}`}
                    >
                      {m.status === "paid" ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {m.status}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pay Slip Modal Detail */}
      {showModal && selectedMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:p-6 animate-in fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-[#050505] border border-[#222] rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col flex-1 max-h-full overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#1a1a1a] bg-[#0a0a0a] flex justify-between items-center rounded-t-3xl shadow-sm z-10 sticky top-0">
              <div className="flex items-center gap-4">
                  {selectedMember.avatar ? (
                    <img src={selectedMember.avatar} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-[#333] object-cover shadow-inner" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 border-2 border-indigo-500/30 flex items-center justify-center text-lg font-black shadow-inner">
                      {selectedMember.member_name[0].toUpperCase()}
                    </div>
                  )}
                <div className="flex flex-col">
                  <h2 className="m-0 text-xl font-bold text-white tracking-wide">{selectedMember.member_name}</h2>
                  <p className="m-0 text-gray-500 text-xs font-semibold tracking-wider uppercase">{months[month-1]} {year} &middot; PAY SLIP</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-[#111] hover:bg-[#222] border border-[#333] text-gray-400 hover:text-white flex items-center justify-center transition-colors">
                <XCircle size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col lg:grid lg:grid-cols-2 gap-6 bg-[#000]">
              
              {/* Financial Breakdown Card */}
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 shadow-inner">
                <h3 className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] mb-4 pb-3 border-b border-[#1a1a1a]">
                  <Calculator size={14} /> Financial Summary
                </h3>
                
                {memberSalaryReport ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm font-semibold text-gray-400">Base Salary</span>
                      <span className="text-sm font-bold text-white">₹{memberSalaryReport.base_salary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm font-semibold text-gray-400">Working Days</span>
                      <span className="text-sm font-bold text-gray-300">{memberSalaryReport.working_days_count} days</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm font-semibold text-gray-400">Daily Rate</span>
                      <span className="text-sm font-bold text-gray-300">₹{memberSalaryReport.daily_rate}</span>
                    </div>
                    
                    <div className="h-px bg-[#1a1a1a] my-2" />
                    
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm font-semibold text-red-500/80">Leave Deductions</span>
                      <span className="text-sm font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                        -₹{memberSalaryReport.deductions.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="mt-4 flex flex-col gap-1 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl relative overflow-hidden">
                      <div className="absolute right-0 top-0 opacity-10 translate-x-2 -translate-y-4">
                        <Receipt size={64} />
                      </div>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.15em]">Total Net Salary</span>
                      <span className="text-2xl font-black text-emerald-400 tracking-tight">₹{memberSalaryReport.net_salary.toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center text-gray-500 text-sm">Loading breakdown...</div>
                )}
              </div>

              {/* Attendance Logic */}
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 shadow-inner flex flex-col">
                <h3 className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] mb-4 pb-3 border-b border-[#1a1a1a] shrink-0">
                  <Calendar size={14} /> Leave History
                </h3>
                
                <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
                  {memberLeaves.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-gray-500 font-semibold text-sm">
                      <CheckCircle2 size={32} className="mb-2 opacity-20" />
                      Perfect attendance this month.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {memberLeaves.map((l: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-[#111] border border-[#1a1a1a] hover:bg-[#161616] transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#222] flex flex-col items-center justify-center shadow-inner">
                              <span className="text-[8px] font-bold text-gray-500 uppercase leading-none mb-0.5">{format(parseISO(l.date), "MMM")}</span>
                              <span className="text-xs font-black text-white leading-none">{format(parseISO(l.date), "dd")}</span>
                            </div>
                            <span className="text-xs font-bold text-gray-400">{format(parseISO(l.date), "EEEE")}</span>
                          </div>
                          <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 uppercase tracking-wide">
                            {l.leave_type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="px-6 py-4 bg-[#0a0a0a] border-t border-[#1a1a1a] flex flex-col sm:flex-row justify-end items-center gap-3 rounded-b-3xl shrink-0">
               <button 
                  onClick={() => setShowModal(false)} 
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#333] hover:border-[#555] bg-[#111] hover:bg-[#222] text-sm font-bold text-gray-300 transition-colors"
                >
                 Close
               </button>
               
               <button 
                  onClick={() => { toggleStatus(selectedMember.member_id, selectedMember.status); setShowModal(false); }}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl border text-sm font-bold transition-colors shadow-none hover:shadow-lg ${
                    selectedMember.status === "paid"
                      ? "bg-[#111] border-red-500/30 text-red-500 hover:bg-red-500/10"
                      : "bg-[#111] border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                  }`}
               >
                 Mark {selectedMember.status === "paid" ? "Unpaid" : "Paid"}
               </button>

               {selectedMember.status === "unpaid" && (
                 <button 
                  disabled={processingPayment}
                  onClick={() => handleRazorpayPayment(selectedMember)} 
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black tracking-wide border border-indigo-500 transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50 shadow-[0_4px_14px_rgba(99,102,241,0.2)]"
                 >
                   {processingPayment ? (
                     <><div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"/> Processing...</>
                   ) : (
                    <><CreditCard size={16} /> Pay with Razorpay</>
                   )}
                 </button>
               )}
            </div>
          </div>
        </div>
      )}
      {/* Payment Success Modal */}
      {showSuccessModal && successPaymentData && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[60] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowSuccessModal(false)}>
          <div className="bg-[#050505] border border-emerald-500/30 rounded-[2.5rem] w-full max-w-2xl shadow-[0_0_50px_rgba(16,185,129,0.15)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            
            <div className="p-8 text-center bg-emerald-500/5 border-b border-emerald-500/10">
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <CheckCircle2 size={40} className="text-black" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">Payment Successful</h2>
              <p className="text-emerald-400 font-bold text-sm tracking-widest uppercase">Transaction ID: {successPaymentData.payment_id}</p>
            </div>

            <div className="p-10 flex flex-col gap-6">
              <div className="flex justify-between items-center p-6 bg-[#0a0a0a] rounded-3xl border border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Generated Invoice For</span>
                  <span className="text-xl font-bold text-white tracking-tight">{successPaymentData.member.member_name}</span>
                  <span className="text-xs text-gray-400">{successPaymentData.member.member_email}</span>
                </div>
                <div className="text-right flex flex-col">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Amount Paid</span>
                  <span className="text-2xl font-black text-emerald-400">₹{successPaymentData.report.net_salary.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Receipt size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">Invoice Auto-Generated</span>
                    <span className="text-xs text-gray-500">The payslip for {months[month-1]} {year} is now available in records.</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <HelpCircle size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-emerald-400">Sent to Gmail</span>
                    <span className="text-xs text-emerald-500/70">A copy of this invoice has been sent to {successPaymentData.member.member_email} via Gmail.</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-4 rounded-2xl bg-white text-black font-black text-sm tracking-widest uppercase hover:bg-gray-200 transition-colors shadow-2xl active:scale-[0.98]"
              >
                Close & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
