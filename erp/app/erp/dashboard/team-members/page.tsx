"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useERPAuth, apiClient } from "@/src/components/erp/ERPAuthContext";
import { Search, Copy, User, Mail, Phone, Briefcase, Users, CheckCircle2 } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  teams: string[];
  team_role?: string;
  avatar?: string;
}

export default function TeamMembersPage() {
  const { user, token } = useERPAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copyStatus, setCopyStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (token) fetchMembers();
  }, [token]);

  const fetchMembers = async () => {
    try {
      // Use teams_only=true to ensure strict team-scoping for colleagues
      const res = await apiClient.get("/api/erp/members?teams_only=true", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(res.data);
    } catch (e) {
      console.error("Failed to fetch team members", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopyStatus({ ...copyStatus, [id]: true });
    setTimeout(() => {
      setCopyStatus(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.position?.toLowerCase().includes(search.toLowerCase())
    );
  }, [members, search]);

  const initials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="w-full text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-3">
            <Users className="text-indigo-500" size={28} />
            Teams Members
          </h1>
          <p className="text-gray-400 text-sm mt-1">Contact information for your team colleagues.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text"
            placeholder="Search colleagues..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-indigo-400 text-sm font-black animate-pulse uppercase tracking-widest">
          Syncing Colleagues...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((m) => (
            <div key={m.id} className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 hover:border-indigo-500/30 transition-all group">
              <div className="flex items-center gap-4 mb-6">
                {m.avatar ? (
                  <img src={m.avatar} alt={m.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/5" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                    {initials(m.name)}
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <h3 className="text-base font-black text-white truncate leading-tight">{m.name}</h3>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">
                    {m.team_role || "Member"}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between group/item">
                  <div className="flex items-center gap-3 text-xs text-gray-400 min-w-0">
                    <Briefcase size={14} className="text-gray-600 shrink-0" />
                    <span className="truncate">{m.position || "Staff"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between group/item">
                  <div className="flex items-center gap-3 text-xs text-gray-400 min-w-0">
                    <Mail size={14} className="text-gray-600 shrink-0" />
                    <span className="truncate">{m.email}</span>
                  </div>
                  <button 
                    onClick={() => handleCopy(m.email, `${m.id}-email`)}
                    className="p-1.5 hover:bg-white/5 rounded-md text-gray-600 hover:text-white transition-colors"
                  >
                    {copyStatus[`${m.id}-email`] ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>

                <div className="flex items-center justify-between group/item">
                  <div className="flex items-center gap-3 text-xs text-gray-400 min-w-0">
                    <Phone size={14} className="text-gray-600 shrink-0" />
                    <span className="truncate">{m.phone || "Not shared"}</span>
                  </div>
                  {m.phone && (
                    <button 
                      onClick={() => handleCopy(m.phone!, `${m.id}-phone`)}
                      className="p-1.5 hover:bg-white/5 rounded-md text-gray-600 hover:text-white transition-colors"
                    >
                      {copyStatus[`${m.id}-phone`] ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#1a1a1a]">
                <div className="flex flex-wrap gap-1.5">
                  {(m.teams || []).map(team => (
                    <span key={team} className="px-2 py-0.5 bg-indigo-500/5 border border-indigo-500/10 rounded text-[9px] font-black text-indigo-400 uppercase tracking-tighter">
                      {team}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {filteredMembers.length === 0 && (
            <div className="col-span-full py-20 text-center border border-dashed border-[#1a1a1a] rounded-3xl">
              <User size={48} className="mx-auto text-gray-800 mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No matching colleagues found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
