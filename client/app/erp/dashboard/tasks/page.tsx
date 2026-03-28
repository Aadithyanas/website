"use client";
import React, { useEffect, useState } from "react";
import { useERPAuth, apiClient, API } from "@/src/components/erp/ERPAuthContext";

interface Comment { id: string; author_name: string; author_avatar?: string; content: string; image?: string; created_at: string; }
interface Member { id: string; name: string; email: string; teams: string[]; team_role?: string; avatar?: string; role: string; }
interface Task { 
  id: string; title: string; description?: string; status: string;
  sprint?: string; team?: string; estimated_time?: string;
  assigned_to: string; assigned_to_name: string; assigned_to_avatar?: string;
  priority: string; due_date?: string;
  created_at: string; updated_at: string; comments: Comment[];
  images: string[];
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
  const { user, token, isAdmin, isLeader } = useERPAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: "", description: "", status: "todo", sprint: "Backlog", 
    team: "", estimated_time: "", assigned_to: "", priority: "medium", due_date: "" 
  });
  const [adding, setAdding] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [commentImage, setCommentImage] = useState<Record<string, string>>({});
  const [showMentions, setShowMentions] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [availableSettings, setAvailableSettings] = useState({ sprints: [] as string[], teams: [] as string[] });
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [currentDate, setCurrentDate] = useState(new Date());

  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => { 
    if (token) {
      fetchTasks();
      fetchMembers();
      fetchSettings();
    }
  }, [token]);

  useEffect(() => {
    const handleUpdate = () => {
      console.log("Real-time Task Update Detected");
      fetchTasks();
    };
    window.addEventListener("erp:task_update" as any, handleUpdate);
    return () => window.removeEventListener("erp:task_update" as any, handleUpdate);
  }, [token]); // Re-bind when token changes to avoid stale header

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
  }, [userTeams, showAdd]);

  const fetchTasks = async () => {
    try {
      const res = await apiClient.get("/api/erp/tasks", { headers: h });
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

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await apiClient.post("/api/erp/tasks", newTask, { headers: h });
      setNewTask({ title: "", description: "", status: "todo", sprint: "Backlog", team: "", estimated_time: "", assigned_to: "", priority: "medium", due_date: "" });
      setShowAdd(false);
      fetchTasks();
    } catch (e) { console.error(e); }
    finally { setAdding(false); }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await apiClient.put(`/api/erp/tasks/${taskId}`, { status }, { headers: h });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    } catch (e) { console.error(e); }
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

  // Group by Status for ClickUp feel
  const statusGroups: Record<string, Task[]> = {};
  STATUSES.forEach(s => statusGroups[s] = []);
  tasks.forEach(t => {
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
    // Padding for first day
    for (let i = 0; i < firstDay; i++) calendarCells.push(<div key={`pad-${i}`} style={{ border: "1px solid #111", minHeight: "100px", padding: "8px" }} />);
    
    for (let d = 1; d <= days; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayTasks = tasks.filter(t => t.due_date === dateStr);
      
      calendarCells.push(
        <div key={d} style={{ border: "1px solid #111", minHeight: "100px", padding: "8px", background: "#030303" }}>
          <div style={{ fontSize: "11px", color: "#444", fontWeight: 700, marginBottom: "8px" }}>{d}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {dayTasks.map(t => (
              <div key={t.id} onClick={() => setExpandedTask(t.id)} style={{ fontSize: "9px", padding: "2px 4px", background: "#0a0a0a", borderLeft: `2px solid ${STATUS_COLORS[t.status]}`, borderRadius: "2px", color: "#ccc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer" }}>
                {t.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div style={{ background: "#000", border: "1px solid #111", borderRadius: "8px", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderBottom: "1px solid #111" }}>
          <h3 style={{ margin: 0, fontSize: "16px", color: "#fff" }}>{monthName} {year}</h3>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="erp-btn-ghost" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>&larr;</button>
            <button className="erp-btn-ghost" onClick={() => setCurrentDate(new Date())}>Today</button>
            <button className="erp-btn-ghost" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>&rarr;</button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "#111", gap: "0px" }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} style={{ padding: "8px", textAlign: "center", fontSize: "10px", fontWeight: 800, color: "#444", textTransform: "uppercase", background: "#000", borderBottom: "1px solid #111" }}>{day}</div>
          ))}
          {calendarCells}
        </div>
      </div>
    );
  };

  if (loading) return <div style={{ padding: "40px", color: "#666", fontSize: "14px" }}>Loading workspace...</div>;

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", borderBottom: "1px solid #111", paddingBottom: "16px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 4px", color: "#fff" }}>Team Space / Project</h1>
          <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#666" }}>
            <span 
              style={{ borderBottom: viewMode === "list" ? "2px solid #7c3aed" : "none", color: viewMode === "list" ? "#fff" : "#666", paddingBottom: "8px", cursor: "pointer" }} 
              onClick={() => setViewMode("list")}
            >
              List View
            </span>
            <span 
              style={{ borderBottom: viewMode === "calendar" ? "2px solid #7c3aed" : "none", color: viewMode === "calendar" ? "#fff" : "#666", paddingBottom: "8px", cursor: "pointer" }} 
              onClick={() => setViewMode("calendar")}
            >
              Calendar
            </span>
          </div>
        </div>
        <button className="erp-btn erp-btn-primary" style={{ padding: "8px 16px", fontSize: "13px" }} onClick={() => setShowAdd(true)}>+ Add Task</button>
      </div>

      {viewMode === "list" ? (
        STATUSES.map(statusKey => (
          <div key={statusKey} style={{ marginBottom: "24px" }}>
            {/* ... same status list logic ... */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", cursor: "pointer" }}>
              <div style={{ width: "16px", height: "16px", borderRadius: "4px", background: STATUS_COLORS[statusKey], position: "relative" }}>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "6px", height: "6px", borderRadius: "50%", background: "#fff" }} />
              </div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: STATUS_COLORS[statusKey], letterSpacing: "0.05em" }}>{STATUS_LABELS[statusKey]}</span>
              <span style={{ fontSize: "11px", color: "#444", fontWeight: 600 }}>{statusGroups[statusKey].length}</span>
            </div>

            <div style={{ background: "#000", border: "1px solid #111", borderRadius: "8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 100px 150px 40px", padding: "8px 16px", borderBottom: "1px solid #111", fontSize: "10px", color: "#444", fontWeight: 700, textTransform: "uppercase" }}>
                <span>Name</span>
                <span>Assignee</span>
                <span>Due Date</span>
                <span>Priority</span>
                <span>Status</span>
                <span></span>
              </div>

              {statusGroups[statusKey].length === 0 && (
                <div style={{ padding: "16px", fontSize: "12px", color: "#333", fontStyle: "italic" }}>No tasks in this status.</div>
              )}

              {statusGroups[statusKey].map(task => (
                <div key={task.id} style={{ borderBottom: "1px solid #111" }}>
                  <div 
                    className="task-row" 
                    style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 100px 150px 40px", padding: "10px 16px", alignItems: "center", cursor: "pointer" }}
                    onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ border: `1px solid ${STATUS_COLORS[statusKey]}`, width: "14px", height: "14px", borderRadius: "50%" }} />
                      <span style={{ fontSize: "13px", color: "#ccc" }}>{task.title}</span>
                    </div>

                    <div onClick={e => e.stopPropagation()}>
                      <select className="erp-select-ghost" style={{ fontSize: "11px" }} value="" onChange={e => handleReassign(task.id, e.target.value)}>
                        <option value="">{task.assigned_to_name}</option>
                        {members.map(m => m.id !== task.assigned_to && <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>

                    <div style={{ fontSize: "11px", color: "#444" }}>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : "--"}
                    </div>

                    <div onClick={e => e.stopPropagation()}>
                      <select 
                        className="erp-select-ghost" 
                        style={{ fontSize: "11px", color: PRIORITY_COLORS[task.priority] || "#666", fontWeight: 700 }}
                        value={task.priority}
                        onChange={e => handlePriorityChange(task.id, e.target.value)}
                      >
                        {PRIORITIES.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                      </select>
                    </div>

                    <div onClick={e => e.stopPropagation()}>
                      <div style={{ position: "relative" }}>
                        <select 
                          className="status-dropdown"
                          style={{ 
                            background: "#000", color: "#fff", border: `1px solid ${STATUS_COLORS[task.status]}`, borderRadius: "4px", padding: "4px 8px 4px 24px", fontSize: "10px", fontWeight: 800, width: "100%",
                            appearance: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
                          }}
                          value={task.status}
                          onChange={e => handleStatusChange(task.id, e.target.value)}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                        </select>
                        <div style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", width: "10px", height: "10px", borderRadius: "50%", background: STATUS_COLORS[task.status], pointerEvents: "none" }}>
                           <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "4px", height: "4px", borderRadius: "50%", background: "#fff" }} />
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right", display: "flex", gap: "8px" }}>
                      {isLeader && (
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} style={{ color: "#333", background: "none", border: "none", cursor: "pointer", fontSize: "12px" }}>✕</button>
                      )}
                    </div>
                  </div>

                  {expandedTask === task.id && (
                    <div style={{ background: "#050505", padding: "24px 40px", borderTop: "1px solid #111" }}>
                        <p style={{ fontSize: "13px", color: "#888", marginBottom: "20px", background: "#0a0a0a", padding: "12px", borderRadius: "8px", border: "1px solid #111" }}>
                          {task.description || "No description provided."}
                        </p>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "40px" }}>
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <p style={{ fontSize: "11px", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "0.05em" }}>ACTIVITY & COMMENTS ({task.comments.length})</p>
                                <div style={{ display: "flex", gap: "8px" }}>
                                  {task.images.map((img, idx) => (
                                    <img key={idx} src={getUrl(img)} alt={`Task Image ${idx}`} style={{ width: "32px", height: "32px", borderRadius: "4px", border: "1px solid #222" }} />
                                  ))}
                                  <label style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a", border: "1px dashed #222", borderRadius: "4px", cursor: "pointer", fontSize: "16px", color: "#333" }}>
                                    +
                                    <input type="file" hidden onChange={e => handleFileUpload(task.id, e)} />
                                  </label>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                                {task.comments.map(c => (
                                  <div key={c.id} style={{ display: "flex", gap: "12px" }}>
                                    <div className="erp-avatar" style={{ width: "28px", height: "28px", fontSize: "10px" }}>{initials(c.author_name)}</div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>{c.author_name}</span>
                                        <span style={{ fontSize: "10px", color: "#333" }}>{new Date(c.created_at).toLocaleString()}</span>
                                      </div>
                                      <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#aaa" }}>{c.content}</p>
                                      {c.image && (
                                        <img src={getUrl(c.image)} alt="Comment Attachment" style={{ marginTop: "10px", maxWidth: "200px", maxHeight: "150px", objectFit: "cover", borderRadius: "8px", border: "1px solid #222" }} />
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>

                            <div style={{ background: "#000", border: "1px solid #222", borderRadius: "12px", padding: "12px" }}>
                                {commentImage[task.id] && (
                                  <div style={{ marginBottom: "12px", position: "relative", display: "inline-block" }}>
                                    <img src={getUrl(commentImage[task.id])} alt="Comment Preview" style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid #333" }} />
                                    <button onClick={() => setCommentImage({ ...commentImage, [task.id]: "" })} style={{ position: "absolute", top: "-8px", right: "-8px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                                  </div>
                                )}
                                <textarea 
                                  style={{ background: "none", border: "none", color: "#fff", width: "100%", outline: "none", fontSize: "13px", minHeight: "60px", resize: "none" }}
                                  placeholder="Write a comment..."
                                  value={commentText[task.id] || ""}
                                  onChange={e => setCommentText({ ...commentText, [task.id]: e.target.value })}
                                />
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", borderTop: "1px solid #111", paddingTop: "8px", position: "relative" }}>
                                  <div style={{ display: "flex", gap: "12px", color: "#444" }}>
                                    <label style={{ fontSize: "16px", cursor: "pointer" }}>
                                      📎
                                      <input type="file" hidden onChange={e => handleFileUpload(task.id, e, true)} />
                                    </label>
                                    <div style={{ position: "relative" }}>
                                      <span style={{ fontSize: "16px", cursor: "pointer", color: showMentions[task.id] ? "#7c3aed" : "#444" }} onClick={() => setShowMentions({ ...showMentions, [task.id]: !showMentions[task.id] })}>@</span>
                                      {showMentions[task.id] && (
                                        <div style={{ position: "absolute", bottom: "100%", left: 0, background: "#0a0a0a", border: "1px solid #222", borderRadius: "8px", padding: "8px", width: "200px", maxHeight: "200px", overflowY: "auto", zIndex: 100, boxShadow: "0 -4px 12px rgba(0,0,0,0.5)" }}>
                                          <p style={{ fontSize: "10px", fontWeight: 800, color: "#444", marginBottom: "8px", textTransform: "uppercase" }}>Mention Member</p>
                                          {members.map(m => (
                                            <div 
                                              key={m.id} 
                                              onClick={() => insertMention(task.id, m.name)}
                                              style={{ padding: "6px 8px", fontSize: "12px", color: "#ccc", cursor: "pointer", borderRadius: "4px" }}
                                              onMouseOver={e => (e.currentTarget.style.background = "#111")}
                                              onMouseOut={e => (e.currentTarget.style.background = "none")}
                                            >
                                              {m.name}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <span style={{ fontSize: "16px", cursor: "pointer" }}>😊</span>
                                    <span style={{ fontSize: "16px", cursor: "pointer" }}>🎥</span>
                                    <span style={{ fontSize: "16px", cursor: "pointer" }}>🎙️</span>
                                  </div>
                                  <button 
                                    onClick={() => handleAddComment(task.id)}
                                    style={{ background: "#7c3aed", color: "#fff", border: "none", padding: "6px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                                  >
                                    {uploading === `comment-${task.id}` ? "Uploading..." : "Post Comment"}
                                  </button>
                                </div>
                            </div>
                          </div>
                        </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        renderCalendar()
      )}

      {/* New Task Modal */}
      {showAdd && (
        <div className="erp-modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="erp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <h2 style={{ margin: "0 0 24px", color: "#fff", fontSize: "22px" }}>Create New Task</h2>
            <form onSubmit={handleAddTask} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label className="erp-label">Task Name</label>
                <input className="erp-input" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="What needs to be done?" required />
              </div>
              
              <div>
                <label className="erp-label">Description</label>
                <textarea className="erp-input" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} placeholder="Add more details..." rows={4} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label className="erp-label">Sprint</label>
                  <select className="erp-input" value={newTask.sprint} onChange={e => setNewTask({ ...newTask, sprint: e.target.value })}>
                    {availableSettings.sprints.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="erp-label">Priority</label>
                  <select className="erp-input" value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label className="erp-label">Assign To</label>
                  <select className="erp-input" value={newTask.assigned_to} onChange={e => setNewTask({ ...newTask, assigned_to: e.target.value })} required>
                    <option value="">Select Assignee</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="erp-label">Due Date</label>
                  <input type="date" className="erp-input" value={newTask.due_date} onChange={e => setNewTask({ ...newTask, due_date: e.target.value })} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button type="button" className="erp-btn erp-btn-ghost" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="erp-btn erp-btn-primary" style={{ flex: 1 }} disabled={adding}>Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .task-row:hover {
          background: #080808 !important;
        }
        .erp-select-ghost {
          background: none;
          border: none;
          color: #aaa;
          outline: none;
          cursor: pointer;
          font-family: inherit;
        }
        .erp-select-ghost:hover {
          color: #fff;
        }
        .erp-select-ghost option {
          background: #000;
          color: #fff;
        }
        .status-dropdown option {
          background: #000;
          color: #fff;
        }
      `}</style>
    </div>
  );
}
