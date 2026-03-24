"use client";
import React, { useEffect, useState } from "react";
import { useERPAuth, apiClient } from "@/src/components/erp/ERPAuthContext";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, parseISO } from "date-fns";

interface Leave { id: string; date: string; description: string; status: "pending" | "approved" | "rejected"; member_name: string; member_id: string; }

const STATUS_COLORS: Record<string, string> = { pending: "#f59e0b", approved: "#34d399", rejected: "#ef4444" };

export default function ERPAttendancePage() {
  const { user, token, isAdmin } = useERPAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [pending, setPending] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchData(); }, [token]);

  const fetchData = async () => {
    try {
      const [lr, pr] = await Promise.all([
        apiClient.get("/api/erp/attendance", { headers: h }),
        isAdmin ? apiClient.get("/api/erp/attendance/pending", { headers: h }) : Promise.resolve({ data: [] }),
      ]);
      setLeaves(lr.data);
      setPending(pr.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !desc.trim()) return;
    setSubmitting(true);
    setMsg("");
    try {
      await apiClient.post("/api/erp/attendance/request", { date: selectedDate, description: desc }, { headers: h });
      setMsg("✅ Leave request submitted!");
      setDesc("");
      setSelectedDate(null);
      fetchData();
    } catch (err: any) {
      setMsg(`❌ ${err?.response?.data?.detail || "Failed to submit"}`);
    } finally { setSubmitting(false); }
  };

  const handleRespond = async (leaveId: string, status: "approved" | "rejected") => {
    try {
      await apiClient.put(`/api/erp/attendance/${leaveId}/respond`, { status }, { headers: h });
      fetchData();
    } catch (e) { console.error(e); }
  };

  // Calendar
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startWeekday = getDay(monthStart); // 0=Sun

  const leaveMap: Record<string, Leave> = {};
  leaves.forEach(l => { leaveMap[l.date] = l; });

  const prevMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));

  if (loading) return <div style={{ color: "#888" }}>Loading attendance...</div>;

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px", color: "#fff" }}>Attendance</h1>
        <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>Click a date to request leave</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "1fr 1fr" : "1fr", gap: "24px" }}>
        {/* Calendar */}
        <div className="erp-card">
          {/* Month nav */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <button onClick={prevMonth} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "18px" }}>‹</button>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#fff" }}>{format(currentMonth, "MMMM yyyy")}</h3>
            <button onClick={nextMonth} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "18px" }}>›</button>
          </div>

          {/* Day labels */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#555", padding: "4px 0" }}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
            {Array.from({ length: startWeekday }).map((_, i) => <div key={`empty-${i}`} />)}
            {days.map(day => {
              const dateStr = format(day, "yyyy-MM-dd");
              const leave = leaveMap[dateStr];
              const isSelected = selectedDate === dateStr;
              const today = isToday(day);

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  style={{
                    aspectRatio: "1",
                    borderRadius: "8px",
                    background: leave
                      ? STATUS_COLORS[leave.status] + "30"
                      : isSelected ? "rgba(167,139,250,0.25)" : today ? "rgba(167,139,250,0.1)" : "transparent",
                    border: leave ? `1px solid ${STATUS_COLORS[leave.status]}50` : isSelected ? "1px solid #a78bfa" : today ? "1px solid rgba(167,139,250,0.3)" : "1px solid transparent",
                    color: leave ? STATUS_COLORS[leave.status] : isSelected ? "#a78bfa" : today ? "#a78bfa" : "#ccc",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: today || leave ? 700 : 400,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s",
                  }}
                  title={leave ? `${leave.status}: ${leave.description}` : ""}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }}>
            {Object.entries(STATUS_COLORS).map(([s, c]) => (
              <span key={s} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#888" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: c, display: "inline-block" }} />{s}
              </span>
            ))}
          </div>

          {/* Leave request form */}
          {selectedDate && (
            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ margin: "0 0 10px", fontSize: "14px", fontWeight: 600, color: "#a78bfa" }}>
                Request leave for {format(parseISO(selectedDate), "MMMM d, yyyy")}
              </p>
              {msg && (
                <div style={{
                  padding: "10px 14px", borderRadius: "8px", marginBottom: "12px", fontSize: "13px",
                  background: msg.startsWith("✅") ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
                  color: msg.startsWith("✅") ? "#34d399" : "#f87171",
                }}>{msg}</div>
              )}
              {leaveMap[selectedDate] ? (
                <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", fontSize: "13px", color: "#ccc" }}>
                  <strong style={{ color: STATUS_COLORS[leaveMap[selectedDate].status] }}>
                    {leaveMap[selectedDate].status.toUpperCase()}
                  </strong>
                  {" — "}{leaveMap[selectedDate].description}
                </div>
              ) : (
                <form onSubmit={handleSubmitLeave} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <textarea
                    className="erp-input"
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder="Reason for leave..."
                    rows={3}
                    required
                    style={{ resize: "none" }}
                  />
                  <button type="submit" className="erp-btn erp-btn-primary" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Leave Request"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Admin: Pending requests */}
        {isAdmin && (
          <div>
            <div className="erp-card">
              <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 600, color: "#fff" }}>
                Pending Requests ({pending.length})
              </h3>
              {pending.length === 0 && <p style={{ color: "#555", fontSize: "14px" }}>No pending leave requests.</p>}
              {pending.map(leave => (
                <div key={leave.id} style={{
                  padding: "14px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  marginBottom: "10px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                    <div>
                      <p style={{ margin: "0 0 2px", fontWeight: 600, color: "#fff", fontSize: "14px" }}>{leave.member_name}</p>
                      <p style={{ margin: "0 0 6px", color: "#a78bfa", fontSize: "12px", fontWeight: 600 }}>
                        {format(parseISO(leave.date), "MMMM d, yyyy")}
                      </p>
                      <p style={{ margin: 0, color: "#888", fontSize: "13px" }}>{leave.description}</p>
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      <button className="erp-btn" onClick={() => handleRespond(leave.id, "approved")}
                        style={{ padding: "6px 12px", background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                        ✓ Approve
                      </button>
                      <button className="erp-btn" onClick={() => handleRespond(leave.id, "rejected")}
                        style={{ padding: "6px 12px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* All leave history */}
            <div className="erp-card" style={{ marginTop: "16px" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: 600, color: "#fff" }}>All Leave Records</h3>
              {leaves.length === 0 && <p style={{ color: "#555", fontSize: "14px" }}>No records.</p>}
              {leaves.map(l => (
                <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#fff", fontWeight: 500 }}>{l.member_name}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>{l.date} · {l.description}</p>
                  </div>
                  <span className={`erp-badge erp-badge-${l.status}`}>{l.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
