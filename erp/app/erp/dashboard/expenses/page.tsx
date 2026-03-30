"use client";
import React, { useEffect, useState } from "react";
import { useERPAuth, apiClient } from "@/src/components/erp/ERPAuthContext";
import { Receipt, Plus, Search, Filter, Trash2, Edit3, DollarSign, Calendar as CalendarIcon, Tag, X, Clock } from "lucide-react";
import { format } from "date-fns";

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
  status: "pending" | "approved" | "rejected";
}

export default function ERPExpensesPage() {
  const { token, isAdmin, hasPermission } = useERPAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({ title: "", amount: "", category: "Software", date: new Date().toISOString().split('T')[0], description: "" });

  useEffect(() => {
    if (token) fetchExpenses();
  }, [token]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/erp/expenses", { headers: { Authorization: `Bearer ${token}` } });
      setExpenses(res.data);
    } catch (e) {
      console.error("Failed to fetch expenses", e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await apiClient.put(`/api/erp/expenses/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: status as any } : e));
    } catch (e) {
      console.error("Failed to update expense status", e);
      alert("Failed to update status");
    }
  };

  const handleAddOrUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        const res = await apiClient.put(`/api/erp/expenses/${editingExpense.id}`, { 
          title: formData.title, 
          amount: parseFloat(formData.amount), 
          category: formData.category, 
          date: formData.date,
          description: formData.description
        }, { headers: { Authorization: `Bearer ${token}` } });
        setExpenses(prev => prev.map(exp => exp.id === editingExpense.id ? res.data : exp));
      } else {
        const res = await apiClient.post("/api/erp/expenses", {
          title: formData.title,
          amount: parseFloat(formData.amount),
          category: formData.category,
          date: formData.date,
          description: formData.description,
          status: "pending"
        }, { headers: { Authorization: `Bearer ${token}` } });
        setExpenses([res.data, ...expenses]);
      }
      closeModal();
    } catch (e) {
      console.error("Failed to save expense", e);
      alert("Failed to save expense");
    }
  };

  const openModal = (exp?: Expense) => {
    if (exp) {
      setEditingExpense(exp);
      setFormData({ title: exp.title, amount: exp.amount.toString(), category: exp.category, date: exp.date, description: exp.description || "" });
    } else {
      setEditingExpense(null);
      setFormData({ title: "", amount: "", category: "Software", date: new Date().toISOString().split('T')[0], description: "" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingExpense(null);
  };

  const deleteExpense = async (id: string) => {
    if (confirm("Are you sure?")) {
      try {
        await apiClient.delete(`/api/erp/expenses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setExpenses(expenses.filter(e => e.id !== id));
      } catch (e) {
        console.error("Failed to delete expense", e);
        alert("Failed to delete expense");
      }
    }
  };

  const totalThisMonth = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingAmount = expenses.filter(e => e.status === "pending").reduce((acc, curr) => acc + curr.amount, 0);
  const pendingCount = expenses.filter(e => e.status === "pending").length;
  
  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const topCategory = Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a])[0] || "None";
  const topCategoryPercent = totalThisMonth > 0 ? Math.round((categoryTotals[topCategory] / totalThisMonth) * 100) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "rejected": return "text-red-400 bg-red-500/10 border-red-500/20";
      default: return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    }
  };

  return (
    <div className="w-full text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-3">
            <Receipt className="text-indigo-500" size={28} />
            Expense Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">Track and manage company expenditures.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} /> New Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign size={48} />
          </div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total This Month</p>
          <p className="text-2xl font-black text-white">$ {totalThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1 font-bold">
            <TrendingUp size={12} /> +4% from last month
          </div>
        </div>
        <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-amber-500">
            <Clock size={48} />
          </div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Pending Approval</p>
          <p className="text-2xl font-black text-amber-500">$ {pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p className="mt-2 text-xs text-gray-500 font-bold">{pendingCount} {pendingCount === 1 ? "expense" : "expenses"} waiting</p>
        </div>
        <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-indigo-400">
            <Tag size={48} />
          </div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Top Category</p>
          <p className="text-2xl font-black text-indigo-400">{topCategory}</p>
          <p className="mt-2 text-xs text-gray-500 font-bold">{topCategoryPercent}% of total spend</p>
        </div>
      </div>

      {/* List */}
      <div className="bg-[#0c0c0c] border border-[#111] rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#080808] border-b border-[#111]">
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Expense Item</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Category</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Date</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right">Amount</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#111]">
            {expenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-[#0f0f0f] transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-sm">{exp.title}</div>
                  <div className="text-[10px] text-gray-600 mt-0.5">ID: {exp.id}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold px-2 py-1 bg-[#161616] border border-[#222] rounded-md text-gray-400 uppercase tracking-wider">
                    {exp.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500 font-semibold">{exp.date}</td>
                <td className="px-6 py-4">
                  {(isAdmin || hasPermission('manage_payroll')) ? (
                    <select 
                      className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border bg-transparent outline-none cursor-pointer ${getStatusColor(exp.status)}`}
                      value={exp.status}
                      onChange={(e) => handleStatusUpdate(exp.id, e.target.value)}
                    >
                      <option value="pending" className="bg-[#0c0c0c]">Pending</option>
                      <option value="approved" className="bg-[#0c0c0c]">Approved</option>
                      <option value="rejected" className="bg-[#0c0c0c]">Rejected</option>
                    </select>
                  ) : (
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${getStatusColor(exp.status)}`}>
                      {exp.status}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-black text-white">$ {exp.amount.toFixed(2)}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openModal(exp)}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                    {(isAdmin || hasPermission('manage_payroll')) && (
                      <button onClick={() => deleteExpense(exp.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={closeModal}>
          <div className="bg-[#050505] border border-[#222] rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black flex items-center gap-2">
                {editingExpense ? <Edit3 className="text-indigo-500" size={24} /> : <Plus className="text-indigo-500" size={24} />} 
                {editingExpense ? "Edit Expense" : "Add Expense"}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddOrUpdateExpense} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Title</label>
                <input 
                  type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="e.g. AWS Hosting Fees"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Amount ($)</label>
                  <input 
                    type="number" required step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Date</label>
                  <input 
                    type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Category</label>
                <select 
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                >
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="SaaS">SaaS</option>
                  <option value="Office">Office</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 rounded-xl border border-[#222] text-sm font-bold text-gray-400 hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white text-sm font-black hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20">
                  {editingExpense ? "Update Expense" : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TrendingUp({ size, className }: { size: number, className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  );
}
