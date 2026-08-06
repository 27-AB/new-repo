import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getServiceUrl } from "../../config/api";

// ─── Style tokens ──────────────────────────────────────────────────────────────
const DARK    = "#0d1b2a";
const SURFACE = "#162030";
const BORDER  = "rgba(255,255,255,0.07)";
const ACCENT  = "#22d3ee";

const inputStyle = {
  width: "100%", background: "#0f1824",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8, padding: "9px 12px",
  color: "#e2e8f0", fontSize: 13,
  outline: "none", fontFamily: "inherit",
  boxSizing: "border-box",
};
const labelStyle = {
  display: "block", color: "#94a3b8", fontSize: 11,
  fontWeight: 600, marginBottom: 5,
  textTransform: "uppercase", letterSpacing: ".05em",
};

// ─── Status / Priority maps ────────────────────────────────────────────────────
const STATUS = {
  not_started: { color: "#64748b", bg: "rgba(100,116,139,0.12)", label: "Not Started", icon: "⬜" },
  in_progress:  { color: "#0ea5e9", bg: "rgba(14,165,233,0.12)", label: "In Progress",  icon: "🔄" },
  completed:   { color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "Completed",    icon: "✅" },
  delayed:     { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  label: "Delayed",      icon: "⚠️" },
  on_hold:     { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "On Hold",      icon: "⏸" },
  cancelled:   { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", label: "Cancelled",    icon: "🚫" },
};

const PRIORITY = {
  critical: { color: "#ef4444", label: "Critical" },
  high:     { color: "#f59e0b", label: "High"     },
  medium:   { color: "#0ea5e9", label: "Medium"   },
  low:      { color: "#22c55e", label: "Low"       },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};
const calcVariance = (plannedEnd, actualEnd) => {
  if (!plannedEnd || !actualEnd) return null;
  const diff = Math.round((new Date(actualEnd) - new Date(plannedEnd)) / 86400000);
  return diff;
};

// ─── Inline error component ────────────────────────────────────────────────────
function InlineError({ msg, onDismiss }) {
  if (!msg) return null;
  return (
    <div style={{
      background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)",
      borderRadius: 8, padding: "10px 16px",
      color: "#fca5a5", fontSize: 13,
      display: "flex", alignItems: "center", gap: 8,
    }}>
      ⚠️ {msg}
      <button onClick={onDismiss}
        style={{ marginLeft:"auto", background:"none", border:"none",
                 color:"#f87171", cursor:"pointer", fontSize:18 }}>×</button>
    </div>
  );
}

// ─── Summary stat card ─────────────────────────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10,
      padding: "14px 18px", flex: "1 1 100px", textAlign: "center",
    }}>
      <div style={{ color: color || "#e2e8f0", fontSize: 22, fontWeight: 700 }}>{value}</div>
      <div style={{ color: "#475569", fontSize: 11, fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: ".06em", marginTop: 4 }}>{label}</div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function TimelineManager({ entityType, entityId, entityTitle }) {
  const { token } = useAuth();
  const [items,    setItems]    = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const [formError,setFormError]= useState("");
  const [filter,   setFilter]   = useState({ status: "", priority: "" });

  const EMPTY_FORM = {
    title: "", description: "",
    plannedStart: "", plannedEnd: "",
    actualStart: "", actualEnd: "",
    status: "not_started", completionPercentage: 0,
    priority: "medium", category: "general", order: 0,
  };
  const [form, setForm] = useState(EMPTY_FORM);

  const apiUrl = () => {
    switch (entityType) {
      case "community": return getServiceUrl("community");
      case "college":   return getServiceUrl("college");
      default:          return getServiceUrl("research");
    }
  };

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      if (filter.status)   params.set("status",   filter.status);
      if (filter.priority) params.set("priority", filter.priority);
      const API = apiUrl();
      const res = await fetch(
        `${API}/timeline/${entityType}/${entityId}/timeline?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.timelineItems || []);
        setSummary(data.summary || null);
      } else throw new Error(data.message || "Failed to load timeline");
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { if (entityId) load(); }, [entityId, filter, entityType]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("");
    try {
      const API = apiUrl();
      const url    = editing ? `${API}/timeline/timeline/${editing._id}` : `${API}/timeline/${entityType}/${entityId}/timeline`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Save failed");
      setShowForm(false); setEditing(null); setForm(EMPTY_FORM);
      load();
    } catch (e) {
      setFormError(e.message);
    } finally { setSaving(false); }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      title:                item.title,
      description:          item.description || "",
      plannedStart:         item.plannedStart?.split("T")[0] || "",
      plannedEnd:           item.plannedEnd?.split("T")[0]   || "",
      actualStart:          item.actualStart?.split("T")[0]  || "",
      actualEnd:            item.actualEnd?.split("T")[0]    || "",
      status:               item.status,
      completionPercentage: item.completionPercentage,
      priority:             item.priority,
      category:             item.category || "general",
      order:                item.order    || 0,
    });
    setFormError(""); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this timeline item?")) return;
    try {
      const API = apiUrl();
      const res = await fetch(`${API}/timeline/timeline/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      load();
    } catch (e) { setError(e.message); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, gap:12, color:"#475569" }}>
      <div style={{ width:28, height:28, border:`3px solid rgba(34,211,238,0.2)`,
                    borderTop:`3px solid ${ACCENT}`, borderRadius:"50%",
                    animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      Loading timeline…
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ color:"#f1f5f9", fontSize:18, fontWeight:700 }}>📅 Timeline Phases</div>
          <div style={{ color:"#475569", fontSize:13, marginTop:4 }}>
            {items.length} phase{items.length !== 1 ? "s" : ""} for {entityTitle} — Planned vs Actual tracking
          </div>
        </div>
        <button
          onClick={() => { setEditing(null); setForm(EMPTY_FORM); setFormError(""); setShowForm(true); }}
          style={{
            background: ACCENT, color: "#0d1b2a", border:"none",
            borderRadius:10, padding:"10px 20px",
            fontSize:13, fontWeight:700, cursor:"pointer",
            boxShadow:`0 4px 16px rgba(34,211,238,0.25)`,
          }}
        >+ Add Phase</button>
      </div>

      {/* Top-level error */}
      <InlineError msg={error} onDismiss={() => setError("")} />

      {/* Summary cards */}
      {summary && (
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <StatCard label="Total"       value={summary.total}      />
          <StatCard label="Completed"   value={summary.completed}  color="#10b981" />
          <StatCard label="In Progress" value={summary.inProgress} color="#0ea5e9" />
          <StatCard label="Delayed"     value={summary.delayed}    color="#ef4444" />
          <StatCard label="Avg Completion" value={`${summary.averageCompletion}%`} color={ACCENT} />
        </div>
      )}

      {/* Filters */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        <select
          value={filter.status}
          onChange={e => setFilter({ ...filter, status: e.target.value })}
          style={{ ...inputStyle, width:"auto", cursor:"pointer" }}
        >
          <option value="">All Statuses</option>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="delayed">Delayed</option>
          <option value="on_hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={filter.priority}
          onChange={e => setFilter({ ...filter, priority: e.target.value })}
          style={{ ...inputStyle, width:"auto", cursor:"pointer" }}
        >
          <option value="">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Modal form */}
      {showForm && (
        <div style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.72)",
          backdropFilter:"blur(4px)", zIndex:500,
          display:"flex", alignItems:"center", justifyContent:"center", padding:20,
        }}>
          <div style={{
            background:SURFACE, borderRadius:16, width:"100%", maxWidth:580,
            border:`1px solid ${BORDER}`, maxHeight:"90vh", overflowY:"auto",
            boxShadow:"0 32px 80px rgba(0,0,0,0.6)",
          }}>
            {/* Modal header */}
            <div style={{
              background:"linear-gradient(135deg,#0f2744,#0d1b2a)",
              borderBottom:`1px solid ${BORDER}`,
              padding:"20px 24px",
              display:"flex", alignItems:"center", justifyContent:"space-between",
            }}>
              <div style={{ color:"#f1f5f9", fontSize:17, fontWeight:700 }}>
                {editing ? "✎ Edit Phase" : "+ New Timeline Phase"}
              </div>
              <button onClick={() => { setShowForm(false); setEditing(null); setFormError(""); }}
                style={{ background:"none", border:"none", color:"#64748b", fontSize:22, cursor:"pointer" }}>×</button>
            </div>

            <div style={{ padding:24, display:"flex", flexDirection:"column", gap:16 }}>
              <InlineError msg={formError} onDismiss={() => setFormError("")} />

              {/* Title */}
              <div>
                <label style={labelStyle}>Phase Title *</label>
                <input type="text" required value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Literature Review Phase"
                  style={inputStyle} />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea rows={3} value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="What happens in this phase?"
                  style={{ ...inputStyle, resize:"vertical" }} />
              </div>

              {/* Planned dates */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={labelStyle}>📅 Planned Start *</label>
                  <input type="date" required value={form.plannedStart}
                    onChange={e => setForm({ ...form, plannedStart: e.target.value })}
                    style={{ ...inputStyle, colorScheme:"dark" }} />
                </div>
                <div>
                  <label style={labelStyle}>📅 Planned End *</label>
                  <input type="date" required value={form.plannedEnd}
                    onChange={e => setForm({ ...form, plannedEnd: e.target.value })}
                    style={{ ...inputStyle, colorScheme:"dark" }} />
                </div>
              </div>

              {/* Actual dates */}
              <div style={{ background:"rgba(255,255,255,0.02)", borderRadius:10,
                            border:`1px solid ${BORDER}`, padding:14 }}>
                <div style={{ color:"#64748b", fontSize:11, fontWeight:700,
                              textTransform:"uppercase", letterSpacing:".06em", marginBottom:12 }}>
                  Actual Dates (fill in as project progresses)
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <label style={labelStyle}>Actual Start</label>
                    <input type="date" value={form.actualStart}
                      onChange={e => setForm({ ...form, actualStart: e.target.value })}
                      style={{ ...inputStyle, colorScheme:"dark" }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Actual End</label>
                    <input type="date" value={form.actualEnd}
                      onChange={e => setForm({ ...form, actualEnd: e.target.value })}
                      style={{ ...inputStyle, colorScheme:"dark" }} />
                  </div>
                </div>
              </div>

              {/* Status, Priority, Progress */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    style={{ ...inputStyle, cursor:"pointer" }}>
                    {Object.entries(STATUS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Priority</label>
                  <select value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    style={{ ...inputStyle, cursor:"pointer" }}>
                    {Object.entries(PRIORITY).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Progress %</label>
                  <input type="number" min={0} max={100}
                    value={form.completionPercentage}
                    onChange={e => setForm({ ...form, completionPercentage: parseInt(e.target.value) || 0 })}
                    style={inputStyle} />
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display:"flex", gap:12, paddingTop:8 }}>
                <button type="button" onClick={handleSubmit} disabled={saving} style={{
                  flex:1, background: ACCENT, color:"#0d1b2a",
                  border:"none", borderRadius:10, padding:"12px 0",
                  fontSize:14, fontWeight:700, cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                }}>
                  {saving ? "Saving…" : editing ? "Update Phase" : "Create Phase"}
                </button>
                <button type="button"
                  onClick={() => { setShowForm(false); setEditing(null); setFormError(""); }}
                  style={{
                    flex:1, background:"rgba(255,255,255,0.05)",
                    border:`1px solid ${BORDER}`, borderRadius:10,
                    padding:"12px 0", fontSize:14, fontWeight:600, color:"#94a3b8", cursor:"pointer",
                  }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline items list */}
      {items.length === 0 ? (
        <div style={{
          textAlign:"center", padding:"60px 20px",
          background:"rgba(255,255,255,0.015)", borderRadius:12,
          border:"1px dashed rgba(255,255,255,0.06)", color:"#475569",
        }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📅</div>
          <div style={{ fontSize:15, fontWeight:600 }}>No timeline phases yet</div>
          <button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); }}
            style={{ marginTop:16, color: ACCENT, background:"none",
                     border:`1px solid ${ACCENT}20`, borderRadius:8,
                     padding:"8px 20px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            Create first phase
          </button>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {items.map(item => {
            const s   = STATUS[item.status]   || STATUS.not_started;
            const pr  = PRIORITY[item.priority] || PRIORITY.medium;
            const variance = calcVariance(item.plannedEnd, item.actualEnd);
            const hasActual = item.actualStart || item.actualEnd;

            return (
              <div key={item._id} style={{
                background: SURFACE, border: `1px solid ${BORDER}`,
                borderLeft: `4px solid ${s.color}`,
                borderRadius: 12, padding: "18px 20px",
                transition: "box-shadow .2s",
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 32px ${s.color}18`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                {/* Top row */}
                <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                  <div style={{ flex:1 }}>
                    {/* Title + badges */}
                    <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:8 }}>
                      <span style={{ fontSize:16 }}>{s.icon}</span>
                      <span style={{ color:"#f1f5f9", fontSize:15, fontWeight:700 }}>{item.title}</span>
                      <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99,
                                     background: s.bg, color: s.color }}>{s.label}</span>
                      <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99,
                                     background:`${pr.color}14`, color: pr.color }}>{pr.label}</span>
                      {item.category && item.category !== "general" && (
                        <span style={{ fontSize:11, padding:"3px 10px", borderRadius:99,
                                       background:"rgba(255,255,255,0.05)", color:"#64748b" }}>
                          {item.category}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p style={{ color:"#64748b", fontSize:13, margin:"0 0 12px", lineHeight:1.6 }}>
                        {item.description}
                      </p>
                    )}

                    {/* Date grid: Planned vs Actual */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:16,
                                  background:"rgba(255,255,255,0.02)", borderRadius:10,
                                  border:`1px solid ${BORDER}`, padding:"12px 14px",
                                  alignItems:"center" }}>
                      {/* Planned */}
                      <div>
                        <div style={{ color:"#475569", fontSize:10, fontWeight:700,
                                      textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>
                          📅 Planned
                        </div>
                        <div style={{ color:"#94a3b8", fontSize:13 }}>
                          {fmtDate(item.plannedStart)} → {fmtDate(item.plannedEnd)}
                        </div>
                        {item.plannedStart && item.plannedEnd && (
                          <div style={{ color:"#475569", fontSize:11, marginTop:2 }}>
                            {Math.round((new Date(item.plannedEnd) - new Date(item.plannedStart)) / 86400000)} days planned
                          </div>
                        )}
                      </div>

                      {/* Actual */}
                      <div>
                        <div style={{ color:"#475569", fontSize:10, fontWeight:700,
                                      textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>
                          ⏱ Actual
                        </div>
                        {hasActual ? (
                          <>
                            <div style={{ color:"#94a3b8", fontSize:13 }}>
                              {fmtDate(item.actualStart)} → {item.actualEnd ? fmtDate(item.actualEnd) : "In progress…"}
                            </div>
                            {item.actualStart && item.actualEnd && (
                              <div style={{ color:"#475569", fontSize:11, marginTop:2 }}>
                                {Math.round((new Date(item.actualEnd) - new Date(item.actualStart)) / 86400000)} days actual
                              </div>
                            )}
                          </>
                        ) : (
                          <div style={{ color:"#334155", fontSize:13 }}>Not started yet</div>
                        )}
                      </div>

                      {/* Variance / On-time indicator */}
                      <div style={{ textAlign:"center" }}>
                        <div style={{ color:"#475569", fontSize:10, fontWeight:700,
                                      textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>
                          Variance
                        </div>
                        {variance !== null ? (
                          <div style={{
                            fontSize:14, fontWeight:800, padding:"4px 10px", borderRadius:8,
                            background: variance > 0 ? "rgba(239,68,68,0.15)" : variance < 0 ? "rgba(16,185,129,0.15)" : "rgba(34,211,238,0.1)",
                            color: variance > 0 ? "#ef4444" : variance < 0 ? "#10b981" : "#22d3ee",
                          }}>
                            {variance > 0 ? `+${variance}d` : variance < 0 ? `${variance}d` : "On time"}
                          </div>
                        ) : (
                          <div style={{ color:"#334155", fontSize:12 }}>—</div>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginTop:12 }}>
                      <div style={{ display:"flex", justifyContent:"space-between",
                                    marginBottom:6, fontSize:12 }}>
                        <span style={{ color:"#475569" }}>Completion</span>
                        <span style={{ color: ACCENT, fontWeight:700 }}>{item.completionPercentage}%</span>
                      </div>
                      <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                        <div style={{
                          height:"100%", width:`${item.completionPercentage}%`,
                          background:`linear-gradient(90deg,${s.color},${s.color}bb)`,
                          borderRadius:3, transition:"width .5s",
                        }} />
                      </div>
                    </div>

                    {/* Delay indicator */}
                    {(item.daysDelayed || 0) > 0 && (
                      <div style={{
                        marginTop:10, display:"inline-flex", alignItems:"center", gap:6,
                        background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)",
                        borderRadius:8, padding:"5px 12px", fontSize:12, color:"#f87171",
                      }}>
                        ⚠️ {item.daysDelayed} day{item.daysDelayed !== 1 ? "s" : ""} behind schedule
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display:"flex", flexDirection:"column", gap:6, flexShrink:0 }}>
                    <button onClick={() => handleEdit(item)} title="Edit"
                      style={{
                        background:"rgba(14,165,233,0.12)", border:"1px solid rgba(14,165,233,0.2)",
                        color:"#0ea5e9", borderRadius:8, padding:"7px 10px",
                        cursor:"pointer", fontSize:15, transition:"background .15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background="rgba(14,165,233,0.25)"}
                      onMouseLeave={e => e.currentTarget.style.background="rgba(14,165,233,0.12)"}
                    >✎</button>
                    <button onClick={() => handleDelete(item._id)} title="Delete"
                      style={{
                        background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)",
                        color:"#ef4444", borderRadius:8, padding:"7px 10px",
                        cursor:"pointer", fontSize:15, transition:"background .15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background="rgba(239,68,68,0.22)"}
                      onMouseLeave={e => e.currentTarget.style.background="rgba(239,68,68,0.1)"}
                    >🗑</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}