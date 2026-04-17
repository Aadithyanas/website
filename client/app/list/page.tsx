"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  CheckCircle2, User, Mail, Phone, Calendar, 
  BookOpen, ExternalLink, Search, Filter, 
  Trash2, Pencil, X, Info, Send 
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function InternshipListPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTrack, setFilterTrack] = useState("All");
  const [editingReg, setEditingReg] = useState<any>(null);

  const fetchRegistrations = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/internships/list`);
      setRegistrations(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete registration for ${name}?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/internships/${id}`);
      setRegistrations(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.patch(`${API_BASE}/api/internships/${editingReg.id}`, editingReg);
      setRegistrations(prev => prev.map(r => r.id === editingReg.id ? editingReg : r));
      setEditingReg(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message);
    }
  };

  const tracks = ["All", ...new Set(registrations.map(r => r.internshipTrack))];

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await axios.patch(`${API_BASE}/api/internships/${id}`, { status: newStatus });
      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message);
    }
  };

  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

  const handleSendEmail = async (id: string) => {
    setSendingEmailId(id);
    try {
      await axios.post(`${API_BASE}/api/internships/${id}/send-success-email`);
      alert("Success email sent to student!");
      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status: "paid" } : r));
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || "Failed to send email");
    } finally {
      setSendingEmailId(null);
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = 
      reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reg.registration_id && reg.registration_id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterTrack === "All" || reg.internshipTrack === filterTrack;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-zinc-500 animate-pulse font-black tracking-widest uppercase">Loading Registrations...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 lg:p-20">
      <div className="max-w-7xl mx-auto space-y-8 md:y-12">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 md:gap-8">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter">INTERNSHIP DASHBOARD</h1>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <div className="relative group w-full sm:w-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 transition-colors group-focus-within:text-indigo-400" />
                <input 
                  type="text" 
                  placeholder="Search name, email, or id..."
                  className="bg-zinc-900/50 border border-white/5 py-3 pl-12 pr-6 rounded-2xl text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all w-full sm:w-64 md:w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative group w-full sm:w-auto">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <select 
                  className="bg-zinc-900/50 border border-white/5 py-3 pl-12 pr-10 rounded-2xl text-sm focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer w-full sm:w-auto min-w-[140px]"
                  value={filterTrack}
                  onChange={(e) => setFilterTrack(e.target.value)}
                >
                  {tracks.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-900/50 border border-white/5 py-3 md:py-4 px-6 md:px-8 rounded-2xl flex items-center justify-between lg:justify-end gap-6">
            <div className="text-right">
              <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Showing</div>
              <div className="text-xl md:text-2xl font-black text-white">{filteredRegistrations.length} <span className="text-zinc-600 text-sm font-medium">/ {registrations.length}</span></div>
            </div>
          </div>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl text-red-500 font-bold flex items-center gap-4">
             <Info className="w-6 h-6" />
             {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Mobile View: Cards */}
          <div className="lg:hidden space-y-4">
            {filteredRegistrations.length === 0 ? (
              <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-12 text-center text-zinc-600 font-black uppercase tracking-widest">
                No registrations found
              </div>
            ) : (
              filteredRegistrations.map((reg) => (
                <div key={reg.id} className="bg-zinc-950 border border-white/5 rounded-3xl p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                        <User className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <div className="font-black text-white uppercase text-sm tracking-tight flex flex-wrap items-center gap-2">
                          {reg.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-medium flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-zinc-600" /> {reg.email}
                        </div>
                      </div>
                    </div>
                    {reg.registration_id && (
                      <span className="text-[9px] bg-white/10 px-2 py-1 rounded text-zinc-400 font-mono self-start">{reg.registration_id}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div className="space-y-1">
                      <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Track</div>
                      <div className="text-[10px] font-black text-indigo-400 uppercase">{reg.internshipTrack}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Period</div>
                      <div className="text-[10px] font-medium text-zinc-400">{reg.internshipPeriod}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Institution</div>
                    <div className="text-xs font-bold text-white uppercase">{reg.institutionName}</div>
                    <div className="text-[9px] text-zinc-500 uppercase">{reg.course} • {reg.stream}</div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <select 
                      value={reg.status || "pending"}
                      onChange={(e) => handleStatusChange(reg.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer outline-none ${
                        reg.status === "paid" 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                        : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                      }`}
                    >
                      <option value="pending">PENDING</option>
                      <option value="paid">PAID</option>
                    </select>

                    <div className="flex items-center gap-2">
                      <button 
                        disabled={sendingEmailId === reg.id}
                        onClick={() => handleSendEmail(reg.id)}
                        className={`p-2 bg-zinc-900 border border-white/5 rounded-lg transition-all ${
                          sendingEmailId === reg.id ? "text-zinc-700 animate-pulse" : "text-zinc-500 hover:text-emerald-400"
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setEditingReg(reg)} className="p-2 bg-zinc-900 border border-white/5 rounded-lg text-zinc-500 hover:text-indigo-400">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(reg.id, reg.name)} className="p-2 bg-zinc-900 border border-white/5 rounded-lg text-zinc-500 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden lg:block bg-zinc-950/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <th className="px-8 py-6">ID & Student</th>
                    <th className="px-8 py-6">Track & Duration</th>
                    <th className="px-8 py-6">Institution</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-zinc-600 font-medium uppercase tracking-widest">
                        {searchTerm ? "No results match your search" : "No registrations found"}
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((reg) => (
                      <tr key={reg.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-8">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner group-hover:scale-110 transition-transform">
                              <User className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                              <div className="font-black text-white uppercase text-sm tracking-tight flex items-center gap-2">
                                {reg.name}
                                {reg.registration_id && (
                                  <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded text-zinc-400 font-mono">{reg.registration_id}</span>
                                )}
                              </div>
                              <div className="text-xs text-zinc-500 font-medium flex items-center gap-1.5 mt-0.5">
                                <Mail className="w-3 h-3 text-zinc-600" /> {reg.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-400">
                              <BookOpen className="w-3 h-3" /> {reg.internshipTrack}
                            </div>
                            <div className="text-xs text-zinc-500 font-medium flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-zinc-600" /> {reg.internshipPeriod}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <div className="text-sm font-bold uppercase tracking-tight">{reg.institutionName}</div>
                          <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1 opacity-60">{reg.course} • {reg.stream}</div>
                        </td>
                        <td className="px-8 py-8">
                          <div className="flex flex-col gap-3">
                            <select 
                              value={reg.status || "pending"}
                              onChange={(e) => handleStatusChange(reg.id, e.target.value)}
                              className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer outline-none ${
                                reg.status === "paid" 
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                                : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                              }`}
                            >
                              <option value="pending">PENDING</option>
                              <option value="paid">PAID</option>
                            </select>
                            
                            <div className="text-[9px] text-zinc-600 font-mono flex flex-col gap-0.5 opacity-60">
                              <span>D: {new Date(reg.created_at).toLocaleDateString()}</span>
                              {reg.amount && <span>Amount: ₹{reg.amount}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-8 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              disabled={sendingEmailId === reg.id}
                              onClick={() => handleSendEmail(reg.id)}
                              title="Send Completion Email"
                              className={`p-2.5 bg-zinc-900 border rounded-xl transition-all shadow-lg ${
                                sendingEmailId === reg.id 
                                ? "text-zinc-700 border-white/5 animate-pulse" 
                                : "text-zinc-500 border-white/5 hover:text-emerald-400 hover:border-emerald-500/30"
                              }`}
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setEditingReg(reg)}
                              className="p-2.5 bg-zinc-900 border border-white/5 rounded-xl text-zinc-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all hover:shadow-indigo-500/5 shadow-lg"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(reg.id, reg.name)}
                              className="p-2.5 bg-zinc-900 border border-white/5 rounded-xl text-zinc-500 hover:text-red-500 hover:border-red-500/30 transition-all hover:shadow-red-500/5 shadow-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingReg && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-zinc-950 border border-white/10 rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setEditingReg(null)}
              className="absolute top-8 right-8 p-3 bg-zinc-900 border border-white/5 rounded-2xl text-zinc-500 hover:text-white transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <form onSubmit={handleUpdate} className="p-6 md:p-12 space-y-6 md:space-y-8">
              <div className="space-y-1">
                <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">Edit Registration</h2>
                <p className="text-zinc-500 text-[10px] md:text-sm font-medium">Update student details for {editingReg.registration_id}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Student Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-3 md:p-4 text-sm focus:outline-none focus:border-indigo-500/50"
                    value={editingReg.name}
                    onChange={(e) => setEditingReg({...editingReg, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-3 md:p-4 text-sm focus:outline-none focus:border-indigo-500/50"
                    value={editingReg.email}
                    onChange={(e) => setEditingReg({...editingReg, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Internship Track</label>
                  <select 
                    className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-3 md:p-4 text-sm focus:outline-none focus:border-indigo-500/50 appearance-none"
                    value={editingReg.internshipTrack}
                    onChange={(e) => setEditingReg({...editingReg, internshipTrack: e.target.value})}
                  >
                    <option value="MERN STACK">MERN STACK</option>
                    <option value="ROBOTICS">ROBOTICS</option>
                    <option value="PYTHON">PYTHON</option>
                    <option value="UI/UX DESIGN">UI/UX DESIGN</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Institution</label>
                  <input 
                    type="text" 
                    className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-3 md:p-4 text-sm focus:outline-none focus:border-indigo-500/50"
                    value={editingReg.institutionName}
                    onChange={(e) => setEditingReg({...editingReg, institutionName: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 md:gap-4">
                <button 
                  type="submit"
                  className="flex-1 bg-white text-black font-black py-4 md:py-5 rounded-2xl md:rounded-3xl hover:bg-indigo-400 hover:text-white transition-all uppercase tracking-tighter text-base md:text-lg shadow-xl"
                >
                  Save Changes
                </button>
                <button 
                  type="button"
                  onClick={() => setEditingReg(null)}
                  className="px-6 md:px-8 bg-zinc-900 border border-white/5 text-zinc-400 font-bold py-3 rounded-2xl md:rounded-3xl hover:bg-zinc-800 transition-all uppercase text-xs md:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
