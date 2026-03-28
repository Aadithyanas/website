"use client";
import React, { useEffect, useState } from "react";
import { useERPAuth, apiClient } from "@/src/components/erp/ERPAuthContext";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, parseISO } from "date-fns";

interface Leave { id: string; date: string; description: string; leave_type: "casual" | "medical"; status: "pending" | "approved" | "rejected"; member_name: string; member_id: string; }
interface SalaryReport { 
  base_salary: number; daily_rate: number; total_approved_leaves: number; 
  casual_leaves: number; medical_leaves: number; unpaid_leaves: number; 
  deductions: number; net_salary: number;
  leave_policy: { casual_limit: number; medical_limit: number; period_months: number; };
}

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
  const [leaveType, setLeaveType] = useState<"casual" | "medical">("casual");
  const [salaryReport, setSalaryReport] = useState<SalaryReport | null>(null);
  const [msg, setMsg] = useState("");

  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchData(); }, [token]);

  useEffect(() => {
    const handleUpdate = () => {
      console.log("Real-time Leave Update Detected");
      fetchData();
    };
    window.addEventListener("erp:leave_update" as any, handleUpdate);
    return () => window.removeEventListener("erp:leave_update" as any, handleUpdate);
  }, [token]);

  const fetchData = async () => {
    try {
      const [lr, pr] = await Promise.all([
        apiClient.get("/api/erp/attendance", { headers: h }),
        isAdmin ? apiClient.get("/api/erp/attendance/pending", { headers: h }) : Promise.resolve({ data: [] }),
      ]);
      setLeaves(lr.data);
      setPending(pr.data);
      
      // Fetch Salary Report for self
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      const sr = await apiClient.get(`/api/erp/salary/report/${user?.id}?month=${month}&year=${year}`, { headers: h });
      setSalaryReport(sr.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !desc.trim()) return;
    setSubmitting(true);
    setMsg("");
    try {
      await apiClient.post("/api/erp/attendance/request", { 
        date: selectedDate, 
        description: desc, 
        leave_type: leaveType 
      }, { headers: h });
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

  const prevMonth = () => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    setCurrentMonth(d);
  };
  const nextMonth = () => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    setCurrentMonth(d);
  };

  useEffect(() => { if (token) fetchData(); }, [currentMonth]);

  if (loading) return <div style={{ color: "#888", padding: "40px" }}>Loading attendance...</div>;

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 4px", color: "#fff", letterSpacing: "-0.02em" }}>Attendance</h1>
        <p style={{ color: "#888", margin: 0, fontSize: "14px" }}>Manage leave requests and track presence.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 380px", gap: "24px" }} className="attendance-grid-container">
        {/* Left Column: Calendar + Admin Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
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
                    aspectRatio: "1.2",
                    borderRadius: "12px",
                    background: leave
                      ? STATUS_COLORS[leave.status] + "20"
                      : isSelected ? "rgba(167,139,250,0.2)" : today ? "rgba(167,139,250,0.1)" : "rgba(255,255,255,0.03)",
                    border: leave ? `1px solid ${STATUS_COLORS[leave.status]}40` : isSelected ? "1px solid #a78bfa" : today ? "1px solid rgba(167,139,250,0.3)" : "1px solid rgba(255,255,255,0.05)",
                    color: leave ? STATUS_COLORS[leave.status] : isSelected ? "#a78bfa" : today ? "#a78bfa" : "#888",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: today || leave ? 800 : 500,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  title={leave ? `${leave.status}: ${leave.description}` : ""}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap", borderTop: "1px solid #111", paddingTop: "12px" }}>
            {Object.entries(STATUS_COLORS).map(([s, c]) => (
              <span key={s} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#666" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: c, display: "inline-block" }} />
                {s.charAt(0).toUpperCase() + s.slice(1)}
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
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button 
                      type="button" 
                      onClick={() => setLeaveType("casual")}
                      style={{ flex: 1, padding: "8px", borderRadius: "6px", background: leaveType === "casual" ? "#7c3aed" : "#1a1a1a", border: "1px solid #222", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}
                    >
                      Casual
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setLeaveType("medical")}
                      style={{ flex: 1, padding: "8px", borderRadius: "6px", background: leaveType === "medical" ? "#7c3aed" : "#1a1a1a", border: "1px solid #222", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}
                    >
                      Medical
                    </button>
                  </div>
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

        {/* Right Column: Salary Report */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="erp-card" style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #050505 100%)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#fff" }}>Monthly Salary Report</h3>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#7c3aed", background: "rgba(124,58,237,0.1)", padding: "4px 8px", borderRadius: "4px" }}>
                {format(currentMonth, "MMM yyyy").toUpperCase()}
              </span>
            </div>

            {salaryReport ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ background: "#111", padding: "16px", borderRadius: "12px", border: "1px solid #222" }}>
                    <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#666", fontWeight: 700 }}>BASE SALARY</p>
                    <p style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#fff" }}>${salaryReport.base_salary.toLocaleString()}</p>
                  </div>
                  <div style={{ background: "#111", padding: "16px", borderRadius: "12px", border: "1px solid #222" }}>
                    <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#ef4444", fontWeight: 700 }}>DEDUCTIONS</p>
                    <p style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#ef4444" }}>-${salaryReport.deductions.toLocaleString()}</p>
                  </div>
                </div>

                <div style={{ background: "linear-gradient(135deg, #7c3aed, #4c1d95)", padding: "20px", borderRadius: "12px", boxShadow: "0 8px 16px rgba(124,58,237,0.2)" }}>
                  <p style={{ margin: "0 0 4px", fontSize: "11px", color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>NET SALARY (ESTIMATED)</p>
                  <p style={{ margin: 0, fontSize: "28px", fontWeight: 900, color: "#fff" }}>${salaryReport.net_salary.toLocaleString()}</p>
                </div>

                <div style={{ paddingTop: "16px", borderTop: "1px solid #222" }}>
                  <p style={{ margin: "0 0 12px", fontSize: "11px", fontWeight: 800, color: "#444" }}>LEAVE UTILIZATION</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", color: "#aaa" }}>Casual Leaves</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: salaryReport.casual_leaves > salaryReport.leave_policy.casual_limit ? "#ef4444" : "#fff" }}>
                        {salaryReport.casual_leaves} / {salaryReport.leave_policy.casual_limit}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", color: "#aaa" }}>Medical Leaves</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: salaryReport.medical_leaves > salaryReport.leave_policy.medical_limit ? "#ef4444" : "#fff" }}>
                        {salaryReport.medical_leaves} / {salaryReport.leave_policy.medical_limit}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed #222", paddingTop: "8px", marginTop: "4px" }}>
                      <span style={{ fontSize: "13px", color: "#aaa" }}>Unpaid/Exceeded Days</span>
                      <span style={{ fontSize: "13px", fontWeight: 800, color: "#ef4444" }}>{salaryReport.unpaid_leaves}</span>
                    </div>
                  </div>
                </div>
                
                <p style={{ margin: 0, fontSize: "11px", color: "#444", fontStyle: "italic", textAlign: "center" }}>
                  * Daily rate for deductions: ${salaryReport.daily_rate}
                </p>
              </div>
            ) : (
              <p style={{ color: "#444", fontSize: "13px" }}>Loading salary details...</p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .attendance-grid-container {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

        {/* Admin Section: Under Calendar in Col 1 */}
        {isAdmin && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "24px" }}>
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
                        style={{ padding: "6px 12px", background: "#065f46", border: "1px solid #059669", color: "#fff", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>
                        Approve
                      </button>
                      <button className="erp-btn" onClick={() => handleRespond(leave.id, "rejected")}
                        style={{ padding: "6px 12px", background: "#991b1b", border: "1px solid #dc2626", color: "#fff", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* All leave history */}
            <div className="erp-card">
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
