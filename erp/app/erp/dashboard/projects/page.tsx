"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useERPAuth, apiClient } from "@/src/components/erp/ERPAuthContext";
import { useRouter } from "next/navigation";
import { Folder, Plus, Search, Filter, Trash2, Edit3, Briefcase, Calendar as CalendarIcon, CheckCircle2, Clock, X, Users } from "lucide-react";

interface Project {
  id: string;
  name: string;
  client_name?: string;
  team: string;
  status: "active" | "completed" | "on_hold";
  progress: number;
  deadline?: string;
  task_stats?: {
    total: number;
    completed: number;
  };
}

export default function ERPProjectsPage() {
  const router = useRouter();
  const { user, token, isAdmin, isLeader } = useERPAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: "", client_name: "", team: "", status: "active" as any, deadline: "" });
  const [filterTeam, setFilterTeam] = useState("");

  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/erp/projects", { headers: h });
      setProjects(res.data);
    } catch (e) {
      console.error("Failed to fetch projects", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject) {
        const res = await apiClient.put(`/api/erp/projects/${editingProject.id}`, formData, { headers: h });
        setProjects(projects.map(p => p.id === editingProject.id ? res.data : p));
      } else {
        const res = await apiClient.post("/api/erp/projects", formData, { headers: h });
        setProjects([res.data, ...projects]);
      }
      closeModal();
    } catch (e: any) {
      alert(e.response?.data?.detail || "Operation failed");
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? Tasks will remain but project association will be removed.")) return;
    try {
      await apiClient.delete(`/api/erp/projects/${id}`, { headers: h });
      setProjects(projects.filter(p => p.id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete project");
    }
  };

  const openModal = (proj?: Project) => {
    if (proj) {
      setEditingProject(proj);
      setFormData({ 
        name: proj.name, 
        client_name: proj.client_name || "", 
        team: proj.team,
        status: proj.status, 
        deadline: proj.deadline || "" 
      });
    } else {
      setEditingProject(null);
      // Auto-set team if user is in only one team
      const userTeams = user?.teams || [];
      setFormData({ 
        name: "", 
        client_name: "", 
        team: userTeams.length === 1 ? userTeams[0] : "",
        status: "active", 
        deadline: "" 
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  const filteredProjects = useMemo(() => {
    if (!filterTeam) return projects;
    return projects.filter(p => p.team === filterTeam);
  }, [projects, filterTeam]);

  const statusColors = {
    active: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    completed: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    on_hold: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  };

  // Only Leaders can See the "Create" UI for themselves
  const canModify = (proj: Project) => {
     if (isAdmin) return false; // Admin is specifically read-only for projects in this requirement
     return user?.team_role === "Team Leader" && (user?.teams || []).includes(proj.team);
  };

  return (
    <div className="w-full text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-3">
            <Folder className="text-indigo-500" size={28} />
            Project Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">Organize tasks and track progress by project.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <select 
              value={filterTeam} 
              onChange={e => setFilterTeam(e.target.value)}
              className="bg-[#0c0c0c] border border-[#1a1a1a] text-xs font-bold text-gray-400 pl-9 pr-4 py-2 rounded-xl outline-none focus:border-indigo-500/50 appearance-none min-w-[140px]"
            >
              <option value="">All Teams</option>
              {Array.from(new Set(projects.map(p => p.team))).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          {user?.team_role === "Team Leader" && (
            <button 
              onClick={() => openModal()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-indigo-500/20 whitespace-nowrap"
            >
              <Plus size={18} /> New Project
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((proj) => (
          <div key={proj.id} className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 hover:border-indigo-500/30 transition-all group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 -translate-y-8 translate-x-8 transition-transform group-hover:scale-110 duration-500`}>
                <Folder size={128} />
            </div>

            <div className="flex justify-between items-start mb-4">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${statusColors[proj.status]}`}>
                {proj.status.replace('_', ' ')}
              </span>
              
              {canModify(proj) && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openModal(proj)}
                    className="text-gray-600 hover:text-white p-1.5 rounded-lg hover:bg-white/5"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => deleteProject(proj.id)}
                    className="text-gray-600 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <h3 className="text-lg font-black text-white mb-1 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{proj.name}</h3>
            <div className="flex items-center justify-between text-xs mb-4">
              <div className="flex items-center gap-2 text-gray-500">
                <Briefcase size={12} />
                {proj.client_name || "Internal"}
              </div>
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold uppercase tracking-wider text-[10px]">
                <Users size={12} /> {proj.team}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {proj.task_stats && proj.task_stats.total > 0 
                    ? `${proj.task_stats.completed}/${proj.task_stats.total} Tasks Done`
                    : "Wait for tasks..."
                  }
                </span>
                <span className="text-xs font-black text-white">{proj.progress}%</span>
              </div>
              <div className="h-1.5 bg-[#111] rounded-full overflow-hidden border border-white/5">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${proj.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'}`}
                  style={{ width: `${proj.progress}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#1a1a1a]">
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Deadline</span>
                <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <CalendarIcon size={12} /> {proj.deadline ? proj.deadline : "TBD"}
                </span>
              </div>
              <button 
                onClick={() => router.push(`/erp/dashboard/tasks?project_id=${proj.id}`)}
                className="bg-white/5 hover:bg-indigo-600/20 text-xs font-bold text-white px-3 py-1.5 rounded-lg border border-white/5 hover:border-indigo-500/30 transition-all font-black uppercase tracking-wider"
              >
                View Tasks
              </button>
            </div>
          </div>
        ))}

        {filteredProjects.length === 0 && !loading && (
          <div className="col-span-full py-20 bg-[#050505] border border-dashed border-[#1a1a1a] rounded-3xl flex flex-col items-center justify-center text-center px-6">
            <Folder size={48} className="text-gray-800 mb-4" />
            <h3 className="text-lg font-bold text-gray-400 mb-2">No Projects Found</h3>
            <p className="text-sm text-gray-600 max-w-sm">
              {filterTeam ? `No projects currently active for ${filterTeam} team.` : "No projects have been started in your workspace yet."}
            </p>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-indigo-400 text-sm font-black animate-pulse uppercase tracking-[0.2em]">
          Syncing Project Data...
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-[#050505] border border-[#222] rounded-3xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
             <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600" />
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black uppercase tracking-tight">{editingProject ? "Update Project" : "Initiate New Project"}</h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
             </div>
             
             <form onSubmit={handleCreateOrUpdate} className="space-y-5">
                <div>
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Project Identification</label>
                   <input 
                     type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                     className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Next-Gen Mobile App" 
                   />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Responsible Team</label>
                    {user?.teams && user.teams.length > 1 ? (
                      <select 
                        required value={formData.team} onChange={e => setFormData({...formData, team: e.target.value})}
                        className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:border-indigo-500 transition-colors appearance-none text-indigo-400"
                      >
                         <option value="">Select Team</option>
                         {user.teams.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    ) : (
                      <div className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm font-bold text-indigo-400">
                        {user?.teams?.[0] || user?.team || "No Team Assigned"}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Project Status</label>
                    <select 
                      value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}
                      className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:border-indigo-500 transition-colors appearance-none"
                    >
                        <option value="active">Active Execution</option>
                        <option value="completed" disabled={!editingProject}>Completed</option>
                        <option value="on_hold">On Hold</option>
                    </select>
                  </div>
                </div>

                <div>
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Client / Organization (Optional)</label>
                   <input 
                     type="text" value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})}
                     className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Star Tech Solutions" 
                   />
                </div>
                
                <div>
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Target Completion Date</label>
                   <input 
                     type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})}
                     className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:border-indigo-500 transition-colors" 
                     style={{ colorScheme: 'dark' }}
                   />
                </div>

                <div className="flex gap-3 pt-6">
                   <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 rounded-xl border border-[#222] text-sm font-bold text-gray-400 hover:bg-white/5 transition-colors">Abort</button>
                   <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white text-sm font-black shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform">
                      {editingProject ? "Confirm Updates" : "Create Project"}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
