"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useERPAuth, apiClient, API } from "@/src/components/erp/ERPAuthContext";
import { Calendar as CalendarIcon, List as ListIcon, Plus, X, Upload, MessageSquare, Paperclip, MoreVertical, Image as ImageIcon } from "lucide-react";

interface Comment { id: string; author_name: string; author_avatar?: string; content: string; image?: string; created_at: string; }
interface Member { id: string; name: string; email: string; teams: string[]; team_role?: string; avatar?: string; role: string; }
interface Task { 
  id: string; title: string; description?: string; status: string;
  sprint?: string; team?: string; estimated_time?: string;
  project_id?: string; project_name?: string;
  assigned_to: string; assigned_to_name: string; assigned_to_avatar?: string;
  priority: string; due_date?: string;
  created_at: string; updated_at: string; comments: Comment[];
  images: string[];
}

interface Project {
  id: string;
  name: string;
  client_name?: string;
  status: string;
  progress: number;
  deadline?: string;
}

const STATUSES = ["todo", "inprogress", "qc", "reviewing", "completed"];
const STATUS_LABELS: Record<string, string> = {
  todo: "TO DO",
  inprogress: "IN PROGRESS",
  qc: "QC",
  reviewing: "REVIEWING",
  completed: "COMPLETE"
};
const STATUS_COLORS: Record<string, string> = {
  todo: "#888",
  inprogress: "#3b82f6",
  qc: "#f59e0b",
  reviewing: "#a78bfa",
  completed: "#10b981"
};

const PRIORITIES = ["urgent", "high", "medium", "low"];
const PRIORITY_COLORS: Record<string, string> = {
  urgent: "#ef4444",
  high: "#f97316",
  medium: "#3b82f6",
  low: "#6b7280"
};

const getUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API}${path}`;
};

export default function ERPTasksPage() {
  const searchParams = useSearchParams();
  const projectIdFilter = searchParams.get("project_id");
  
  const { user, token, isAdmin, isLeader } = useERPAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: "", description: "", status: "todo", sprint: "Backlog", 
    team: "", estimated_time: "", assigned_to: "", priority: "medium", due_date: "",
    project_id: "" 
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [adding, setAdding] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [commentImage, setCommentImage] = useState<Record<string, string>>({});
  const [showMentions, setShowMentions] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [availableSettings, setAvailableSettings] = useState({ sprints: [] as string[], teams: [] as string[] });
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [currentDate, setCurrentDate] = useState(new Date());

  const [filterTeam, setFilterTeam] = useState("");
  const [filterMember, setFilterMember] = useState("");

  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => { 
    if (token) {
      fetchTasks();
      fetchMembers();
      fetchSettings();
      fetchProjects();
    }
  }, [token, filterTeam, filterMember]);

  useEffect(() => {
    const handleUpdate = () => {
      console.log("Real-time Task Update Detected");
      fetchTasks();
    };
    window.addEventListener("erp:task_update" as any, handleUpdate);
    return () => window.removeEventListener("erp:task_update" as any, handleUpdate);
  }, [token]);

  const fetchSettings = async () => {
    try {
      const res = await apiClient.get("/api/erp/settings", { headers: h });
      setAvailableSettings(res.data);
    } catch (e) { console.error("Failed to fetch settings", e); }
  };

  const userTeams = isAdmin ? availableSettings.teams : (user?.teams || []);
  
  useEffect(() => {
    if (userTeams.length === 1 && !newTask.team && showAdd) {
      setNewTask(prev => ({ ...prev, team: userTeams[0] }));
    }
    // Auto-set project if filter is active
    if (projectIdFilter && showAdd && !newTask.project_id) {
      setNewTask(prev => ({ ...prev, project_id: projectIdFilter }));
    }
  }, [userTeams, showAdd, projectIdFilter]);

  const fetchTasks = async () => {
    try {
      let url = "/api/erp/tasks?";
      if (filterTeam) url += `team=${encodeURIComponent(filterTeam)}&`;
      if (filterMember) url += `assigned_to_name=${encodeURIComponent(filterMember)}&`;
      
      const res = await apiClient.get(url, { headers: h });
      setTasks(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };


  const fetchMembers = async () => {
    try {
      const res = await apiClient.get("/api/erp/members", { headers: h });
      setMembers(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchProjects = async () => {
    try {
      const res = await apiClient.get("/api/erp/projects", { headers: h });
      setProjects(res.data);
    } catch (e) { console.error("Failed to fetch projects", e); }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const selectedProject = projects.find(p => p.id === newTask.project_id);
      const payload = { 
        ...newTask, 
        project_name: selectedProject?.name || undefined 
      };
      
      await apiClient.post("/api/erp/tasks", payload, { headers: h });
      setNewTask({ 
        title: "", description: "", status: "todo", sprint: "Backlog", 
        team: "", estimated_time: "", assigned_to: "", priority: "medium", due_date: "",
        project_id: ""
      });
      setShowAdd(false);
      fetchTasks();
    } catch (e) { console.error(e); }
    finally { setAdding(false); }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    // Optimized: Update local state immediately for snappy UI
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    
    try {
      // Use standard object for the put request
      await apiClient.put(`/api/erp/tasks/${taskId}`, { status }, { headers: h });
      console.log(`Task ${taskId} status updated to ${status}`);
    } catch (e) { 
      console.error("Failed to update status on server", e);
      // Revert if failed
      fetchTasks();
      alert("Failed to update task status. Please try again.");
    }
  };

  const handlePriorityChange = async (taskId: string, priority: string) => {
    try {
      await apiClient.put(`/api/erp/tasks/${taskId}`, { priority }, { headers: h });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, priority } : t));
    } catch (e) { console.error(e); }
  };

  const handleReassign = async (taskId: string, targetMemberId: string) => {
    if (!targetMemberId) return;
    try {
      await apiClient.post(`/api/erp/tasks/${taskId}/reassign`, { assigned_to: targetMemberId }, { headers: h });
      fetchTasks();
    } catch (e) { console.error(e); alert("Failed to reassign"); }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await apiClient.delete(`/api/erp/tasks/${taskId}`, { headers: h });
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (e) { console.error(e); }
  };

  const handleFileUpload = async (taskId: string, e: React.ChangeEvent<HTMLInputElement>, isComment = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(isComment ? `comment-${taskId}` : taskId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiClient.post(`/api/erp/tasks/${taskId}/upload`, formData, {
        headers: { ...h, "Content-Type": "multipart/form-data" }
      });
      
      if (isComment) {
        setCommentImage({ ...commentImage, [taskId]: res.data.url });
      } else {
        fetchTasks();
      }
    } catch (e) { console.error(e); alert("Upload failed"); }
    finally { setUploading(null); }
  };

  const handleAddComment = async (taskId: string) => {
    const text = commentText[taskId];
    const image = commentImage[taskId];
    if (!text?.trim() && !image) return;
    try {
      await apiClient.post(`/api/erp/tasks/${taskId}/comments`, { content: text || "", image }, { headers: h });
      setCommentText({ ...commentText, [taskId]: "" });
      setCommentImage({ ...commentImage, [taskId]: "" });
      setShowMentions({ ...showMentions, [taskId]: false });
      fetchTasks();
    } catch (e) { console.error(e); }
  };

  const insertMention = (taskId: string, name: string) => {
    const currentText = commentText[taskId] || "";
    setCommentText({ ...commentText, [taskId]: currentText + `@${name} ` });
    setShowMentions({ ...showMentions, [taskId]: false });
  };

  const initials = (name: string) => name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  // Filter and Group Tasks
  const filteredTasks = useMemo(() => {
    if (!projectIdFilter) return tasks;
    return tasks.filter(t => t.project_id === projectIdFilter);
  }, [tasks, projectIdFilter]);

  const activeProject = useMemo(() => {
    if (!projectIdFilter) return null;
    return projects.find(p => p.id === projectIdFilter);
  }, [projects, projectIdFilter]);

  const statusGroups: Record<string, Task[]> = {};
  STATUSES.forEach(s => statusGroups[s] = []);
  filteredTasks.forEach(t => {
    const s = STATUSES.includes(t.status) ? t.status : "todo";
    statusGroups[s].push(t);
  });

  // Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const monthName = currentDate.toLocaleString("default", { month: "long" });

    const calendarCells = [];
    for (let i = 0; i < firstDay; i++) calendarCells.push(<div key={`pad-${i}`} className="border border-[#111] min-h-[100px] p-2 bg-[#000]" />);
    
    for (let d = 1; d <= days; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayTasks = tasks.filter(t => t.due_date === dateStr);
      
      calendarCells.push(
        <div key={d} className="border border-[#111] min-h-[100px] p-2 bg-[#050505]">
          <div className="text-[11px] text-[#555] font-bold mb-2">{d}</div>
          <div className="flex flex-col gap-1">
            {dayTasks.map(t => (
              <div 
                key={t.id} 
                onClick={() => setExpandedTask(t.id)} 
                className="text-[9px] px-1.5 py-0.5 bg-[#111] border-l-2 rounded-sm text-gray-300 truncate cursor-pointer hover:bg-[#222]"
                style={{ borderLeftColor: STATUS_COLORS[t.status] }}
              >
                {t.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-[#000] border border-[#111] rounded-xl overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-[#111] bg-[#030303]">
          <h3 className="m-0 text-base text-white font-bold">{monthName} {year}</h3>
          <div className="flex gap-2">
            <button className="erp-btn-ghost text-xs px-3 py-1.5 rounded-lg" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>&larr;</button>
            <button className="erp-btn-ghost text-xs px-3 py-1.5 rounded-lg" onClick={() => setCurrentDate(new Date())}>Today</button>
            <button className="erp-btn-ghost text-xs px-3 py-1.5 rounded-lg" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>&rarr;</button>
          </div>
        </div>
        <div className="grid grid-cols-7 bg-[#111] gap-px">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="p-2 text-center text-[10px] font-extrabold text-[#555] uppercase bg-[#000] border-b border-[#111]">{day}</div>
          ))}
          {calendarCells}
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-10 text-[#666] text-sm font-semibold">Loading workspace...</div>;

  return (
    <div className="w-full">
      {/* Dynamic Header: Specialized Project Dashboard or General Workspace */}
      <div className="border-b border-[#1a1a1a] pb-6 mb-8">
        {activeProject ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">
                  <span className="cursor-pointer hover:underline" onClick={() => window.location.href = '/erp/dashboard/projects'}>Projects</span>
                  <span className="text-gray-600">/</span>
                  <span>Dashboard</span>
                </div>
                <h1 className="text-3xl font-black text-white m-0 tracking-tight flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-indigo-500 rounded-full" />
                  {activeProject.name}
                </h1>
                <div className="flex items-center gap-3 text-xs font-bold text-gray-500 mt-1">
                   <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded border border-white/5">
                      <ListIcon size={12} className="text-gray-400" /> {filteredTasks.length} Tasks Total
                   </div>
                   <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded border border-white/5">
                      <CalendarIcon size={12} className="text-gray-400" /> {activeProject.deadline || "No deadline"}
                   </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  className="bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl text-sm font-bold border border-white/5 transition-all" 
                  onClick={() => window.location.href = '/erp/dashboard/projects'}
                >
                  Exit Dashboard
                </button>
                <button 
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-indigo-500/20" 
                  onClick={() => setShowAdd(true)}
                >
                  <Plus size={16} /> Add Project Task
                </button>
              </div>
            </div>

            {/* Project Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#111]">
               <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-500 tracking-wider">
                     <span>Project Progress</span>
                     <span className="text-white">
                       {filteredTasks.length > 0 
                         ? Math.round((filteredTasks.filter(t => t.status === 'completed').length / filteredTasks.length) * 100) 
                         : activeProject.progress
                       }%
                     </span>
                  </div>
                  <div className="h-1.5 bg-[#111] rounded-full overflow-hidden border border-white/5">
                     <div 
                        className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000" 
                        style={{ 
                          width: `${filteredTasks.length > 0 
                            ? Math.round((filteredTasks.filter(t => t.status === 'completed').length / filteredTasks.length) * 100) 
                            : activeProject.progress}%` 
                        }} 
                      />
                  </div>
               </div>
               <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                   <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <Plus size={16} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-gray-500 uppercase">Completed</span>
                      <span className="text-xs font-bold text-white">{filteredTasks.filter(t => t.status === 'completed').length} Tasks</span>
                   </div>
               </div>
               <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                   <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <MessageSquare size={16} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-gray-500 uppercase">Active Activity</span>
                      <span className="text-xs font-bold text-white">4 Conversations</span>
                   </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold m-0 mb-2 text-white tracking-tight">Organization Workspace</h1>
                <div className="flex gap-4 text-xs font-black uppercase tracking-wider text-[#666]">
                  <button 
                    className={`flex items-center gap-1.5 pb-2 border-b-2 transition-colors ${viewMode === "list" ? "border-indigo-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`} 
                    onClick={() => setViewMode("list")}
                  >
                    <ListIcon size={14} /> List View
                  </button>
                  <button 
                    className={`flex items-center gap-1.5 pb-2 border-b-2 transition-colors ${viewMode === "calendar" ? "border-indigo-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`} 
                    onClick={() => setViewMode("calendar")}
                  >
                    <CalendarIcon size={14} /> Calendar
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-[#444] uppercase">Team:</span>
                    <select 
                        className="bg-[#111] border-[#222] text-xs text-gray-300 rounded-lg py-1.5 px-3 focus:outline-none border"
                        value={filterTeam}
                        onChange={e => setFilterTeam(e.target.value)}
                    >
                        <option value="">All Teams</option>
                        {availableSettings.teams.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-[#444] uppercase">Member:</span>
                    <input 
                        className="bg-[#111] border-[#222] text-xs text-gray-300 rounded-lg py-1.5 px-3 focus:outline-none border w-32"
                        placeholder="Search name..."
                        value={filterMember}
                        onChange={e => setFilterMember(e.target.value)}
                    />
                </div>
                {(filterTeam || filterMember) && (
                    <button 
                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300"
                        onClick={() => { setFilterTeam(""); setFilterMember(""); }}
                    >
                        Clear Filters
                    </button>
                )}
              </div>
            </div>
            {(isAdmin || isLeader || (user?.permissions || []).includes("manage_projects")) && (
              <button 
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-[0_4px_20px_rgba(99,102,241,0.2)]" 
                onClick={() => setShowAdd(true)}
              >
                <Plus size={16} /> Create Task
              </button>
            )}
          </div>

        )}
      </div>

      {viewMode === "list" ? (
        <div className="flex flex-col gap-8">
          {STATUSES.map(statusKey => {
            const taskCount = statusGroups[statusKey].length;
            
            // Only show groups that have tasks
            const showGroup = taskCount > 0;
            
            if (!showGroup) return null;

            return (
              <div key={statusKey} className="flex flex-col gap-3">
                {/* Status Header */}
                <div className="flex items-center gap-2 px-1 select-none">
                  <div className="relative w-4 h-4 rounded" style={{ backgroundColor: STATUS_COLORS[statusKey] }}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: STATUS_COLORS[statusKey] }}>
                    {STATUS_LABELS[statusKey]}
                  </span>
                  <span className="text-[11px] text-gray-500 font-bold bg-[#111] px-1.5 rounded-full">
                    {taskCount}
                  </span>
                </div>

                {/* Task Container */}
                <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl overflow-hidden shadow-xl">
                  {/* Desktop Columns Header */}
                  <div className="hidden lg:grid grid-cols-[minmax(0,2fr)_minmax(120px,1fr)_120px_120px_160px_40px] px-4 py-3 bg-[#0a0a0a] border-b border-[#1a1a1a] text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    <span>Task Name</span>
                    <span>Assignee</span>
                    <span>Due Date</span>
                    <span>Priority</span>
                    <span>Status</span>
                    <span></span>
                  </div>

                  {taskCount === 0 ? (
                    <div className="p-5 text-xs text-gray-500 font-medium italic text-center bg-[#000]">
                      No tasks in this status. Add a task to get started.
                    </div>
                  ) : (
                    <div className="flex flex-col divide-y divide-[#1a1a1a]">
                      {statusGroups[statusKey].map(task => (
                        <div key={task.id} className="flex flex-col bg-[#000]">
                          
                          {/* Task Row */}
                          <div 
                            className="flex flex-col lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(120px,1fr)_120px_120px_160px_40px] px-4 py-3 gap-3 lg:gap-0 lg:items-center cursor-pointer hover:bg-[#0a0a0a] transition-colors"
                            onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                          >
                            {/* Title Section */}
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-200 line-clamp-2 lg:line-clamp-1">
                                  {task.title}
                                </span>
                                {task.project_name && (
                                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-0.5">
                                    {task.project_name}
                                  </span>
                                )}
                              </div>

                            {/* Details Grid for Mobile / Row for Desktop */}
                            <div className="grid grid-cols-2 gap-3 lg:contents pl-6 lg:pl-0">
                              
                              {/* Assignee */}
                              <div className="flex flex-col lg:block gap-1.5 truncate" onClick={e => e.stopPropagation()}>
                                <span className="text-[10px] text-gray-500 font-bold uppercase lg:hidden">Assignee</span>
                                <div className="relative">
                                  <select 
                                    className="bg-[#111] border-[#222] lg:bg-transparent lg:border-transparent lg:hover:border-[#333] lg:hover:bg-[#111] border text-xs font-semibold text-gray-300 rounded-lg py-1.5 pl-2.5 pr-7 focus:outline-none transition-colors w-full cursor-pointer appearance-none truncate"
                                    value={task.assigned_to} 
                                    onChange={e => handleReassign(task.id, e.target.value)}
                                  >
                                    {members.map(m => <option key={m.id} value={m.id} className="bg-black text-white">{m.name}</option>)}
                                  </select>
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                  </div>
                                </div>
                              </div>

                              {/* Due Date */}
                              <div className="flex flex-col lg:block gap-1.5 truncate">
                                <span className="text-[10px] text-gray-500 font-bold uppercase lg:hidden">Due Date</span>
                                <span className="text-xs font-medium text-gray-400 py-1.5 inline-block px-1">
                                  {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "--"}
                                </span>
                              </div>

                              {/* Priority */}
                              <div className="flex flex-col lg:block gap-1.5 truncate" onClick={e => e.stopPropagation()}>
                                <span className="text-[10px] text-gray-500 font-bold uppercase lg:hidden">Priority</span>
                                <div className="relative">
                                  <select 
                                    className="bg-[#111] border-[#222] lg:bg-transparent lg:border-transparent lg:hover:border-[#333] lg:hover:bg-[#111] border text-xs font-bold rounded-lg py-1.5 pl-2.5 pr-7 focus:outline-none transition-colors w-full cursor-pointer appearance-none"
                                    style={{ color: PRIORITY_COLORS[task.priority] || "#666" }}
                                    value={task.priority}
                                    onChange={e => handlePriorityChange(task.id, e.target.value)}
                                  >
                                    {PRIORITIES.map(p => <option key={p} value={p} className="bg-black text-white">{p.toUpperCase()}</option>)}
                                  </select>
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: PRIORITY_COLORS[task.priority] || "#666" }}>
                                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                                  </div>
                                </div>
                              </div>

                              {/* Status Dropdown */}
                              <div className="col-span-2 lg:col-span-1 mt-1 lg:mt-0" onClick={e => e.stopPropagation()}>
                                <div className="relative w-full max-w-[150px]">
                                  <select 
                                    className="w-full bg-[#111] text-white border text-[10px] font-black uppercase tracking-wider rounded-lg py-2 lg:py-1.5 pl-8 pr-7 focus:outline-none appearance-none cursor-pointer transition-colors hover:bg-[#1a1a1a]"
                                    style={{ borderColor: STATUS_COLORS[task.status] }}
                                    value={task.status}
                                    onChange={e => handleStatusChange(task.id, e.target.value)}
                                  >
                                    {STATUSES.map(s => <option key={s} value={s} className="bg-black text-white">{STATUS_LABELS[s]}</option>)}
                                  </select>
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none" style={{ backgroundColor: STATUS_COLORS[task.status] }}>
                                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white" />
                                  </div>
                                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: STATUS_COLORS[task.status] }}>
                                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="absolute lg:relative top-3 right-3 lg:top-0 lg:right-0 text-right">
                              {isLeader && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} 
                                  className="p-1.5 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                  title="Delete Task"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Expanded Detail Panel */}
                          {expandedTask === task.id && (
                            <div className="bg-[#050505] p-4 lg:p-6 border-t border-[#1a1a1a] flex flex-col gap-6 shadow-inner">
                              
                              {/* Description */}
                              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                  <ListIcon size={12} /> Description
                                </h4>
                                <p className="text-sm text-gray-300 leading-relaxed m-0 whitespace-pre-wrap">
                                  {task.description || <span className="text-gray-600 italic">No description provided for this task.</span>}
                                </p>
                              </div>

                              {/* Activity & Comments */}
                              <div>
                                <div className="flex justify-between items-center mb-4">
                                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest m-0 flex items-center gap-2">
                                    <MessageSquare size={12} /> Activity & Comments ({task.comments.length})
                                  </h4>
                                  
                                  {/* Task Attachments Header */}
                                  <div className="flex gap-2 items-center">
                                    {task.images.slice(0, 3).map((img, idx) => (
                                      <img key={idx} src={getUrl(img)} alt="Task attachment" className="w-8 h-8 rounded-lg object-cover border border-[#222]" />
                                    ))}
                                    {task.images.length > 3 && <div className="w-8 h-8 rounded-lg bg-[#111] border border-[#222] flex items-center justify-center text-[10px] text-gray-400 font-bold">+{task.images.length - 3}</div>}
                                    <label className="w-8 h-8 flex items-center justify-center bg-[#111] hover:bg-[#222] border border-[#333] rounded-lg cursor-pointer text-gray-400 transition-colors tooltip tooltip-left" data-tip="Add Attachment">
                                      <Plus size={14} />
                                      <input type="file" hidden onChange={e => handleFileUpload(task.id, e)} />
                                    </label>
                                  </div>
                                </div>

                                {/* Comments List */}
                                <div className="flex flex-col gap-4 mb-5">
                                    {task.comments.map(c => (
                                      <div key={c.id} className="flex gap-3 bg-[#0a0a0a] p-3 rounded-xl border border-[#1a1a1a]">
                                        <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-[10px] font-bold shrink-0">
                                          {initials(c.author_name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-xs font-bold text-gray-200">{c.author_name}</span>
                                            <span className="text-[10px] text-gray-600">{new Date(c.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                          </div>
                                          <p className="text-sm text-gray-400 m-0 break-words leading-relaxed whitespace-pre-wrap">{c.content}</p>
                                          {c.image && (
                                            <img src={getUrl(c.image)} alt="Comment Attachment" className="mt-3 max-w-full sm:max-w-xs h-32 object-cover rounded-lg border border-[#222]" />
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                </div>

                                {/* Comment Input */}
                                <div className="bg-[#0a0a0a] border border-[#222] focus-within:border-indigo-500/50 rounded-xl p-3 transition-colors relative">
                                  {commentImage[task.id] && (
                                    <div className="relative inline-block mb-3">
                                      <img src={getUrl(commentImage[task.id])} alt="Preview" className="w-24 h-16 object-cover rounded-md border border-[#333]" />
                                      <button 
                                        onClick={() => setCommentImage({ ...commentImage, [task.id]: "" })} 
                                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow-md"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  )}
                                  
                                  <textarea 
                                    className="w-full bg-transparent border-none text-sm text-white placeholder-gray-600 outline-none resize-none min-h-[60px]"
                                    placeholder="Write a comment... Use @ to mention"
                                    value={commentText[task.id] || ""}
                                    onChange={e => {
                                      const val = e.target.value;
                                      setCommentText({ ...commentText, [task.id]: val });
                                      if (val.endsWith("@")) setShowMentions({ ...showMentions, [task.id]: true });
                                      else if (showMentions[task.id] && !val.includes("@")) setShowMentions({ ...showMentions, [task.id]: false });
                                    }}
                                  />
                                  
                                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#1a1a1a]">
                                    <div className="flex gap-2">
                                      <label className="p-1.5 text-gray-500 hover:text-white hover:bg-[#222] rounded-lg cursor-pointer transition-colors">
                                        <Paperclip size={16} />
                                        <input type="file" hidden onChange={e => handleFileUpload(task.id, e, true)} />
                                      </label>
                                      
                                      <div className="relative">
                                        <button 
                                          className={`p-1.5 rounded-lg transition-colors text-sm font-black ${showMentions[task.id] ? "text-indigo-400 bg-indigo-500/10" : "text-gray-500 hover:text-white hover:bg-[#222]"}`}
                                          onClick={() => setShowMentions({ ...showMentions, [task.id]: !showMentions[task.id] })}
                                        >
                                          @
                                        </button>
                                        
                                        {/* Mentions Dropdown */}
                                        {showMentions[task.id] && (
                                          <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#111] border border-[#333] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden fade-in animate-in slide-in-from-bottom-2">
                                            <div className="p-2 bg-[#0a0a0a] border-b border-[#222] text-[10px] font-bold text-gray-500 uppercase tracking-wider">Mention Someone</div>
                                            <div className="max-h-40 overflow-y-auto p-1 text-sm">
                                              {members.map(m => (
                                                <div 
                                                  key={m.id} 
                                                  onClick={() => insertMention(task.id, m.name)}
                                                  className="p-2 hover:bg-[#222] text-gray-300 hover:text-white rounded-lg cursor-pointer transition-colors"
                                                >
                                                  {m.name}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => handleAddComment(task.id)}
                                      disabled={uploading === `comment-${task.id}` || (!commentText[task.id]?.trim() && !commentImage[task.id])}
                                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
                                    >
                                      {uploading === `comment-${task.id}` ? "Uploading..." : "Post"}
                                    </button>
                                  </div>
                                </div>
                              </div>

                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        renderCalendar()
      )}

      {/* New Task Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowAdd(false)}>
          <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[#222] flex justify-between items-center">
              <h2 className="text-xl font-bold text-white m-0">Create Task</h2>
              <button className="text-gray-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#222] transition-colors" onClick={() => setShowAdd(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddTask} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Task Name <span className="text-red-500">*</span></label>
                <input 
                  className="w-full bg-[#111] border border-[#333] focus:border-indigo-500 focus:bg-[#161616] text-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm placeholder-gray-600" 
                  value={newTask.title} 
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })} 
                  placeholder="What needs to be done?" 
                  required 
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
                <textarea 
                  className="w-full bg-[#111] border border-[#333] focus:border-indigo-500 focus:bg-[#161616] text-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm placeholder-gray-600 resize-none min-h-[100px]" 
                  value={newTask.description} 
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })} 
                  placeholder="Add more details, links, or context..." 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Project</label>
                <select 
                  className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm appearance-none cursor-pointer" 
                  value={newTask.project_id} 
                  onChange={e => setNewTask({ ...newTask, project_id: e.target.value })}
                >
                  <option value="">No Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Sprint</label>
                  <select 
                    className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm appearance-none cursor-pointer" 
                    value={newTask.sprint} 
                    onChange={e => setNewTask({ ...newTask, sprint: e.target.value })}
                  >
                    {availableSettings.sprints.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Priority</label>
                  <select 
                    className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm font-semibold appearance-none cursor-pointer" 
                    style={{ color: PRIORITY_COLORS[newTask.priority] || "#fff" }}
                    value={newTask.priority} 
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    {PRIORITIES.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Assignee <span className="text-red-500">*</span></label>
                  <select 
                    className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm appearance-none cursor-pointer" 
                    value={newTask.assigned_to} 
                    onChange={e => setNewTask({ ...newTask, assigned_to: e.target.value })} 
                    required
                  >
                    <option value="" disabled>Select Assignee</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Due Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-[#111] border border-[#333] text-gray-300 rounded-xl px-4 py-2.5 outline-none transition-colors text-sm cursor-pointer" 
                    style={{ colorScheme: "dark" }}
                    value={newTask.due_date} 
                    onChange={e => setNewTask({ ...newTask, due_date: e.target.value })} 
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-[#222]">
                <button type="button" className="flex-1 px-4 py-2.5 rounded-xl border border-[#333] text-white hover:bg-[#111] font-bold text-sm transition-colors" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors shadow-lg disabled:opacity-50" disabled={adding}>
                  {adding ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
