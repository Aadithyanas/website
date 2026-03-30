"use client";
import React, { useEffect, useState } from "react";
import { useERPAuth, apiClient } from "@/src/components/erp/ERPAuthContext";
import { useRouter } from "next/navigation";
import { Folder, Plus, Search, Filter, Trash2, Edit3, Briefcase, Calendar as CalendarIcon, CheckCircle2, Clock, X } from "lucide-react";

interface Project {
  id: string;
  name: string;
  client_id?: string;
  client_name?: string;
  status: "active" | "completed" | "on_hold";
  budget?: number;
  progress: number;
  deadline?: string;
  task_stats?: {
    total: number;
    completed: number;
  };
}

export default function ERPProjectsPage() {
  const router = useRouter();
  const { token, isAdmin, hasPermission } = useERPAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: "", client_name: "", status: "active" as any, progress: 0, deadline: "" });

  useEffect(() => {
    if (token) {
      fetchProjectsAndStats();
    }
  }, [token]);

  const fetchProjectsAndStats = async () => {
    setLoading(true);
    try {
      // 1. Fetch Projects
      let currentProjects: Project[] = [];
      const saved = localStorage.getItem("erp_projects");
      if (saved) {
        currentProjects = JSON.parse(saved);
      } else {
        currentProjects = [
          { id: "p1", name: "Website Redesign", client_name: "Acme Corp", status: "active", progress: 65, deadline: "2026-05-15" },
          { id: "p2", name: "Mobile App Development", client_name: "Star Tech", status: "active", progress: 30, deadline: "2026-07-01" },
          { id: "p3", name: "Brand Identity", client_name: "Global Solutions", status: "completed", progress: 100, deadline: "2026-03-20" },
          { id: "p4", name: "ERP Integration", client_name: "Internal", status: "on_hold", progress: 15, deadline: "2026-12-31" },
        ];
        localStorage.setItem("erp_projects", JSON.stringify(currentProjects));
      }

      // 2. Fetch Tasks to calculate real stats
      const tasksRes = await apiClient.get("/api/erp/tasks", { headers: { Authorization: `Bearer ${token}` } });
      const allTasks = tasksRes.data;

      // 3. Map stats to projects
      const projectsWithStats = currentProjects.map(proj => {
        const projTasks = allTasks.filter((t: any) => t.project_id === proj.id);
        const completed = projTasks.filter((t: any) => t.status === 'completed').length;
        const total = projTasks.length;
        
        // Calculate dynamic progress if there are tasks
        const dynamicProgress = total > 0 ? Math.round((completed / total) * 100) : proj.progress;

        return {
          ...proj,
          progress: dynamicProgress,
          task_stats: { total, completed }
        };
      });

      setProjects(projectsWithStats);
    } catch (e) {
      // Fallback: Try to just fetch projects if stats fail
      const saved = localStorage.getItem("erp_projects");
      if (saved) setProjects(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  };

  const saveProjects = (newList: Project[]) => {
    setProjects(newList);
    localStorage.setItem("erp_projects", JSON.stringify(newList));
  };

  const handleCreateOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      const updated = projects.map(p => p.id === editingProject.id ? { ...p, ...formData } : p);
      saveProjects(updated);
    } else {
      const newProj: Project = {
        id: "p" + Math.random().toString(36).substr(2, 5),
        ...formData,
        progress: Number(formData.progress) || 0
      };
      saveProjects([newProj, ...projects]);
    }
    closeModal();
  };

  const deleteProject = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      saveProjects(projects.filter(p => p.id !== id));
    }
  };

  const openModal = (proj?: Project) => {
    if (proj) {
      setEditingProject(proj);
      setFormData({ name: proj.name, client_name: proj.client_name || "", status: proj.status, progress: proj.progress, deadline: proj.deadline || "" });
    } else {
      setEditingProject(null);
      setFormData({ name: "", client_name: "", status: "active", progress: 0, deadline: "" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  const statusColors = {
    active: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    completed: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    on_hold: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  };

  return (
    <div className="w-full text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-3">
            <Folder className="text-indigo-500" size={28} />
            Project Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">Organize tasks and track progress by project.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <div key={proj.id} className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 hover:border-indigo-500/30 transition-all group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 -translate-y-8 translate-x-8 transition-transform group-hover:scale-110 duration-500`}>
                <Folder size={128} />
            </div>

            <div className="flex justify-between items-start mb-4">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${statusColors[proj.status]}`}>
                {proj.status.replace('_', ' ')}
              </span>
              <button 
                onClick={() => openModal(proj)}
                className="text-gray-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/5"
              >
                <Edit3 size={16} />
              </button>
              {(isAdmin || hasPermission('manage_projects')) && (
                <button 
                  onClick={() => deleteProject(proj.id)}
                  className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <h3 className="text-lg font-black text-white mb-1 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{proj.name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <Briefcase size={12} />
              {proj.client_name || "No Client"}
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {proj.task_stats && proj.task_stats.total > 0 
                    ? `${proj.task_stats.completed}/${proj.task_stats.total} Tasks Done`
                    : "Progress"
                  }
                </span>
                <span className="text-xs font-black text-white">{proj.progress}%</span>
              </div>
              <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
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
                className="bg-white/5 hover:bg-indigo-600/20 text-xs font-bold text-white px-3 py-1.5 rounded-lg border border-white/5 hover:border-indigo-500/30 transition-all"
              >
                View Tasks
              </button>
            </div>
          </div>
        ))}

        {/* Add Project Card */}
        <button 
          onClick={() => setShowModal(true)}
          className="border-2 border-dashed border-[#1a1a1a] hover:border-indigo-500/30 bg-transparent rounded-2xl p-6 flex flex-col items-center justify-center gap-3 group transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-[#0c0c0c] border border-[#1a1a1a] flex items-center justify-center text-gray-600 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all">
            <Plus size={24} />
          </div>
          <span className="text-sm font-bold text-gray-600 group-hover:text-white transition-colors">Start New Project</span>
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-500 text-sm font-bold animate-pulse">
          Loading projects...
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={closeModal}>
          <div className="bg-[#050505] border border-[#222] rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black">{editingProject ? "Edit Project" : "Create New Project"}</h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-white"><X size={20} /></button>
             </div>
             <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                <div>
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Project Name</label>
                   <input 
                     type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                     className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl py-3 px-4 text-sm outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Q2 Marketing Campaign" 
                   />
                </div>
                <div>
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Client / Organization</label>
                   <input 
                     type="text" value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})}
                     className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl py-3 px-4 text-sm outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Acme Corp" 
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Status</label>
                    <select 
                      value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}
                      className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl py-3 px-4 text-sm outline-none focus:border-indigo-500 transition-colors appearance-none"
                    >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="on_hold">On Hold</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Progress (%)</label>
                    <input 
                      type="number" min="0" max="100" value={formData.progress} onChange={e => setFormData({...formData, progress: Number(e.target.value)})}
                      className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl py-3 px-4 text-sm outline-none focus:border-indigo-500 transition-colors" 
                    />
                  </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Deadline</label>
                   <input 
                     type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})}
                     className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl py-3 px-4 text-sm outline-none focus:border-indigo-500 transition-colors" 
                     style={{ colorScheme: 'dark' }}
                   />
                </div>
                <div className="flex gap-3 pt-6">
                   <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 rounded-xl border border-[#222] text-sm font-bold text-gray-400">Cancel</button>
                   <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white text-sm font-black shadow-lg shadow-indigo-500/20">
                      {editingProject ? "Update Project" : "Create Project"}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
