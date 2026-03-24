"use client";
import React, { useEffect, useState, useRef } from "react";
import { useERPAuth, apiClient } from "@/src/components/erp/ERPAuthContext";

interface Comment { id: string; author_name: string; author_avatar?: string; content: string; created_at: string; }
interface Task { 
  id: string; title: string; description?: string; status: string;
  assigned_to: string; assigned_to_name: string; assigned_to_avatar?: string;
  created_at: string; updated_at: string; comments: Comment[];
}

const STATUSES = ["pending", "ongoing", "testing", "previewing", "completed"];

export default function ERPTasksPage() {
  const { user, token, isAdmin } = useERPAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", status: "pending" });
  const [adding, setAdding] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);

  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchTasks(); }, [token]);

  const fetchTasks = async () => {
    try {
      const res = await apiClient.get("/api/erp/tasks", { headers: h });
      setTasks(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await apiClient.post("/api/erp/tasks", newTask, { headers: h });
      setNewTask({ title: "", description: "", status: "pending" });
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

  const handleAddComment = async (taskId: string) => {
    const content = commentText[taskId]?.trim();
    if (!content) return;
    setSubmittingComment(taskId);
    try {
      await apiClient.post(`/api/erp/tasks/${taskId}/comments`, { content }, { headers: h });
      setCommentText(prev => ({ ...prev, [taskId]: "" }));
      fetchTasks();
    } catch (e) { console.error(e); }
    finally { setSubmittingComment(null); }
  };

  const initials = (name: string) => name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  if (loading) return <div style={{ color: "#888" }}>Loading tasks...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px", color: "#fff" }}>
            {isAdmin ? "All Tasks" : "My Tasks"}
          </h1>
          <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>{tasks.length} tasks total</p>
        </div>
        <button className="erp-btn erp-btn-primary" onClick={() => setShowAdd(true)}>+ New Task</button>
      </div>

      {/* Add Task Modal */}
      {showAdd && (
        <div className="erp-modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="erp-modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: 700, color: "#fff" }}>New Task</h2>
            <form onSubmit={handleAddTask} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="erp-label">Title *</label>
                <input className="erp-input" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="Task title" required />
              </div>
              <div>
                <label className="erp-label">Description</label>
                <textarea className="erp-input" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} placeholder="Optional description..." rows={3} style={{ resize: "vertical" }} />
              </div>
              <div>
                <label className="erp-label">Status</label>
                <select className="erp-select erp-input" value={newTask.status} onChange={e => setNewTask({ ...newTask, status: e.target.value })}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" className="erp-btn erp-btn-ghost" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="erp-btn erp-btn-primary" style={{ flex: 1 }} disabled={adding}>{adding ? "Adding..." : "Add Task"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#555" }}>
          <p style={{ fontSize: "40px", margin: "0 0 12px" }}>📋</p>
          <p style={{ fontSize: "16px" }}>No tasks yet. Add your first task!</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {tasks.map(task => (
          <div key={task.id} className="erp-card">
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              {/* Assignee avatar */}
              <div title={task.assigned_to_name}>
                {task.assigned_to_avatar ? (
                  <img src={task.assigned_to_avatar} alt={task.assigned_to_name} style={{ width: "36px", height: "36px", borderRadius: "9999px" }} />
                ) : (
                  <div className="erp-avatar">{initials(task.assigned_to_name)}</div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#fff" }}>{task.title}</h3>
                  {isAdmin && (
                    <span style={{ fontSize: "12px", color: "#888" }}>— {task.assigned_to_name}</span>
                  )}
                </div>
                {task.description && <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>{task.description}</p>}
              </div>

              {/* Status dropdown */}
              <select
                className="erp-select"
                value={task.status}
                onChange={e => handleStatusChange(task.id, e.target.value)}
                style={{ flexShrink: 0 }}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>

              {/* Expand */}
              <button
                onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer", padding: "4px", flexShrink: 0 }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={expandedTask === task.id ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
              </button>
            </div>

            {/* Comments section */}
            {expandedTask === task.id && (
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: 600, color: "#888" }}>
                  Comments ({task.comments.length})
                </p>
                {task.comments.map(c => (
                  <div key={c.id} style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    {c.author_avatar ? (
                      <img src={c.author_avatar} alt={c.author_name} style={{ width: "28px", height: "28px", borderRadius: "9999px", flexShrink: 0 }} />
                    ) : (
                      <div className="erp-avatar" style={{ width: "28px", height: "28px", fontSize: "10px", flexShrink: 0 }}>{initials(c.author_name)}</div>
                    )}
                    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "8px 12px", flex: 1 }}>
                      <p style={{ margin: "0 0 3px", fontSize: "12px", fontWeight: 600, color: "#a78bfa" }}>{c.author_name}</p>
                      <p style={{ margin: 0, fontSize: "13px", color: "#ccc" }}>{c.content}</p>
                      <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#555" }}>{new Date(c.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {/* Add comment */}
                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  <input
                    className="erp-input"
                    value={commentText[task.id] || ""}
                    onChange={e => setCommentText(prev => ({ ...prev, [task.id]: e.target.value }))}
                    placeholder="Add a comment..."
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddComment(task.id); } }}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="erp-btn erp-btn-primary"
                    onClick={() => handleAddComment(task.id)}
                    disabled={submittingComment === task.id}
                    style={{ flexShrink: 0 }}
                  >
                    {submittingComment === task.id ? "..." : "Send"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
