import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { Badge, SectionCard, PageHeader, Btn, Loader, ErrorMsg, fmtETB } from "../components/ui";

import { getServiceUrl } from "../config/api";
import TimelineManager from "../components/ui/TimelineManager";
import MilestoneManager from "../components/ui/MilestoneManager";
import ProjectSocialHub from "../components/ui/ProjectSocialHub"; // Ensure this file exists in components/ui/
import GanttChart from "../components/ui/GanttChart";
import ExpenditureManager from "../components/ui/ExpenditureManager";
import EthicsComplianceManager from "../components/ui/EthicsComplianceManager";
import NotificationCenter from "../components/ui/NotificationCenter";
import AICopilotPanel from "../components/ai/AICopilotPanel";

const API = getServiceUrl("community");

// Correct official colleges
const COLLEGES = [
  "College of Electrical Engineering & Computing",
  "College of Mechanical, Chemical & Materials Engineering",
  "College of Civil Engineering and Architecture",
  "College of Applied Natural Science",
  "College of Humanities and Social Science",
  "Postgraduate Programs",
];

const CENTERS_OF_EXCELLENCE = [
  "None",
  "IoT and Smart Systems",
  "Renewable Energy",
  "Data Science and AI",
  "Advanced Manufacturing",
  "Water Resources",
  "Food Security",
  "Health Innovation"
];

export default function CommunityProjects() {
  const { token, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState("");
  const [status,   setStatus]   = useState("");
  
  // Tabs and Hotspots
  const [activeTab, setActiveTab] = useState("table_view"); // "table_view" or "impact_map"
  const [hoveredLocation, setHoveredLocation] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState({ title:"", lead:"", college:"", location:"Adama", status:"active", startDate:"", endDate:"", budgetETB:0, beneficiaries:0, volunteers:0, tags:"", summary:"", impact:"", collaborators:[], department:"", centerOfExcellence:"None", fundingSource:"ASTU Internal", publications:0, teamSize:1, externalLink:"", currency: "ETB",
  dmpUrl: "",
  consentFormUrl: "" });
  const [allResearchers, setAllResearchers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeView, setActiveView] = useState("table_view"); // "table_view", "timeline", "milestones", "gantt", "social"
  const [showBudget, setShowBudget] = useState(false);
  const [showEthics, setShowEthics] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [timelines, setTimelines] = useState([]);
  const [milestones, setMilestones] = useState([]);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ limit:50, ...(search && {search}), ...(status && {status}) });
      const res = await fetch(`${API}/community-projects?${params}`, { headers:{ Authorization:`Bearer ${token}` }});
      const d = await res.json();
      setProjects(d.projects||[]); setTotal(d.total||0);
    } catch(e){ setError(e.message); }
    finally { setLoading(false); }
  }, [token, search, status]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (token && (user?.role === "admin" || user?.role === "researcher")) {
      const authAPI = getServiceUrl("auth");
      fetch(`${authAPI}/auth/researchers`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(d => {
          if (d.success) setAllResearchers(d.researchers || []);
        })
        .catch(console.error);
    }
  }, [token, user]);

  const handleSeed = async () => {
    await fetch(`${API}/community-projects/seed`, { method:"POST", headers:{ Authorization:`Bearer ${token}` }});
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    await fetch(`${API}/community-projects/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` }});
    load();
  };
  // Logic for Extension Requests
  const submitExtensionRequest = async () => {
    if (!extensionForm.newEndDate || !extensionForm.justification) {
      alert("Please fill in all fields");
      return;
    }
    try {
      const res = await fetch(`${API}/community-projects/${selectedProject._id}/extension`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(extensionForm)
      });
      if (res.ok) {
        alert("Extension request submitted successfully!");
        setShowExtensionModal(false);
        load(); 
      }
    } catch (e) { console.error("Extension error:", e); }
  };

  // Logic for Termination
  const handleTerminate = async (projectId) => {
    const reason = window.prompt("Enter reason for termination (e.g., Budget Exhausted, Project Abandoned):");
    if (!reason) return;
    await fetch(`${API}/community-projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: "terminated", terminationReason: reason })
    });
    load(); 
  };

  // Load timelines for Gantt chart
  const loadTimelines = async () => {
    try {
      const res = await fetch(`${API}/timeline/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTimelines(data.timelineItems || []);
      }
    } catch (e) {
      console.error("Error loading timelines:", e);
      setTimelines([]);
    }
  };

  // Load milestones for projects
  const loadMilestones = async () => {
    try {
      const res = await fetch(`${API}/milestones/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMilestones(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Error loading milestones:", e);
      setMilestones([]);
    }
  };

  // Load timeline and milestone data when switching to relevant views
  useEffect(() => {
    if (activeView === "gantt" || activeView === "milestones") {
      loadTimelines();
      loadMilestones();
    }
  }, [activeView, token]);

  const [saveMsg, setSaveMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveMsg("");
    try {
      const formData = new FormData();
      
      // Add all form fields
      Object.keys(form).forEach(key => {
        if (key === 'collaborators') {
          formData.append(key, JSON.stringify(form[key]));
        } else {
          formData.append(key, form[key]);
        }
      });
      
      // Add file attachments
      if (attachments.length > 0) {
        attachments.forEach(file => {
          formData.append('attachments', file);
        });
      }
      
      const url = editing ? `${API}/community-projects/${editing._id}` : `${API}/community-projects`;
      const method = editing ? "PUT" : "POST";
      
      const res = await fetch(url, { 
        method, 
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      const d = await res.json();
      if (!res.ok) {
        if (res.status === 403 && d.owner) {
          throw new Error(`Access denied. This project belongs to ${d.owner}. Only the owner or an admin can edit it.`);
        }
        throw new Error(d.message || "Save failed");
      }
      
      setSaveMsg("✅ Project saved successfully!");
      setTimeout(() => {
        setShowForm(false); setEditing(null);
        setForm({ title:"", lead:"", college:"", location:"Adama", status:"active", startDate:"", endDate:"", budgetETB:0, beneficiaries:0, volunteers:0, tags:"", summary:"", impact:"", collaborators:[], department:"", centerOfExcellence:"None", fundingSource:"ASTU Internal", publications:0, teamSize:1, externalLink:"" });
        setAttachments([]);
        setSaveMsg("");
        load();
      }, 1000);
    } catch (e) {
      setSaveMsg("❌ " + e.message);
    }
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ 
      ...p, 
      tags: (p.tags||[]).join(", "),
      collaborators: p.collaborators || []
    });
    setShowForm(true);
  };

  const totalBenef = projects.reduce((s,p)=>s+(p.beneficiaries||0),0);
  const totalVols  = projects.reduce((s,p)=>s+(p.volunteers||0),0);
  const totalBudg  = projects.reduce((s,p)=>s+(p.budgetETB||0),0);

  // --- Dynamic SVG Impact Map Calculations ---
  const LOCATIONS_CONFIG = {
    adama:     { name: "Adama (HQ)", cx: 280, cy: 220, color: "#38bdf8" },
    wonji:     { name: "Wonji District", cx: 380, cy: 300, color: "#34d399" },
    modjo:     { name: "Modjo Substation", cx: 180, cy: 190, color: "#f59e0b" },
    bishoftu:  { name: "Bishoftu Corridor", cx: 80, cy: 140, color: "#a78bfa" }
  };

  const getAggregateByLocation = (locKey) => {
    const matched = projects.filter(p => p.location?.toLowerCase().includes(locKey));
    return {
      count: matched.length,
      budget: matched.reduce((s, p) => s + (p.budgetETB || 0), 0),
      beneficiaries: matched.reduce((s, p) => s + (p.beneficiaries || 0), 0),
      volunteers: matched.reduce((s, p) => s + (p.volunteers || 0), 0),
      list: matched.map(m => m.title)
    };
  };

  return (
    <div>
      <PageHeader title="Community Projects" sub={`${total} outreach projects in and around East Shewa`}
        actions={<>
          {projects.length===0 && <Btn onClick={handleSeed} variant="secondary">Seed Sample Data</Btn>}
          {(user?.role==="admin"||user?.role==="researcher") && (
            <>
              <Btn onClick={() => setShowNotifications(true)} variant="secondary">
                🔔 Notifications
              </Btn>
              <Btn onClick={()=>setShowForm(true)}>+ Add Project</Btn>
            </>
          )}
        </>}
      />

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 20, paddingBottom: 2 }}>
        <button
          onClick={() => { setActiveTab("table_view"); setActiveView("table_view"); }}
          style={{
            background: "transparent", border: "none",
            borderBottom: activeTab === "table_view" ? "2px solid #34d399" : "2px solid transparent",
            color: activeTab === "table_view" ? "#34d399" : "#64748b",
            padding: "10px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all .15s"
          }}>
          📁 Projects Table View
        </button>
        <button
          onClick={() => setActiveTab("impact_map")}
          style={{
            background: "transparent", border: "none",
            borderBottom: activeTab === "impact_map" ? "2px solid #34d399" : "2px solid transparent",
            color: activeTab === "impact_map" ? "#34d399" : "#64748b",
            padding: "10px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all .15s"
          }}>
          🗺️ Interactive Regional Impact Map
        </button>
        <button
          onClick={() => { setActiveTab("gantt_chart"); loadTimelines(); loadMilestones(); }}
          style={{
            background: "transparent", border: "none",
            borderBottom: activeTab === "gantt_chart" ? "2px solid #34d399" : "2px solid transparent",
            color: activeTab === "gantt_chart" ? "#34d399" : "#64748b",
            padding: "10px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all .15s"
          }}>
          📊 Gantt & Timeline View
        </button>
      </div>

      {/* Impact summary row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:22 }}>
        {[
          { label:"Total Beneficiaries", value: totalBenef.toLocaleString(), icon:"👥", color:"#34d399" },
          { label:"Total Volunteers",    value: totalVols.toLocaleString(),  icon:"🙋", color:"#38bdf8" },
          { label:"Total Budget",        value: fmtETB(totalBudg),           icon:"💰", color:"#f59e0b" },
        ].map(({ label,value,icon,color })=>(
          <div key={label} style={{ background:"#162030", border:`1px solid ${color}25`, borderRadius:12, padding:"16px 20px", display:"flex", alignItems:"center", gap:14 }}>
            <span style={{ fontSize:26 }}>{icon}</span>
            <div>
              <div style={{ color, fontSize:22, fontWeight:700 }}>{value}</div>
              <div style={{ color:"#64748b", fontSize:12 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {loading && <Loader />}
      {error   && <ErrorMsg message={error} />}

      {!loading && !error && (
        <>
          {/* Tab 1: Table List View */}
          {activeTab === "table_view" && (
            <>
              {/* Filters */}
              <div style={{ display:"flex", gap:12, marginBottom:20 }}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search projects…"
                  style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 14px", color:"#e2e8f0", fontSize:13, width:280, outline:"none", fontFamily:"inherit" }} />
                <select value={status} onChange={e=>setStatus(e.target.value)}
                  style={{ background:"#162030", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 14px", color:"#94a3b8", fontSize:13, outline:"none", fontFamily:"inherit" }}>
                  <option value="">All Status</option>
                  {["active","completed","paused","planned"].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>

              <SectionCard title={`${total} Community Projects`}>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                    <thead>
                      <tr>{["Title","Lead","College","Department","Location","Beneficiaries","Budget","Status","Actions"].map(h=>(
                        <th key={h} style={{ textAlign:"left", padding:"8px 12px", color:"#475569", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:".05em", borderBottom:"1px solid rgba(255,255,255,0.06)", whiteSpace:"nowrap" }}>{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {projects.map(p=>(
                        <tr key={p._id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}
                          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <td style={{ padding:"10px 12px", color:"#e2e8f0", fontWeight:500, maxWidth:220, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }} title={p.title}>{p.title}</td>
                          <td style={{ padding:"10px 12px", color:"#94a3b8", whiteSpace:"nowrap" }}>{p.lead}</td>
                          <td style={{ padding:"10px 12px", color:"#64748b", fontSize:12 }}>{p.college?.replace("College of ","")}</td>
                          <td style={{ padding:"10px 12px", color:"#64748b", fontSize:12 }}>{p.department || "-"}</td>
                          <td style={{ padding:"10px 12px", color:"#64748b", fontSize:12 }}>
                            <div>{p.location}</div>
                            {p.createdByName && (
                              <div style={{ color: "#475569", fontSize: 10, marginTop: 2 }}>👤 {p.createdByName}</div>
                            )}
                          </td>
                          <td style={{ padding:"10px 12px", color:"#34d399", fontWeight:600 }}>{(p.beneficiaries||0).toLocaleString()}</td>
                          <td style={{ padding:"10px 12px", color:"#f59e0b", fontSize:12, fontFamily:"monospace" }}>{fmtETB(p.budgetETB||0)}</td>
                          <td style={{ padding:"10px 12px" }}><Badge status={p.status} />
                          {/* NEW: Show the reason ONLY if project is terminated */}
                          {p.status === 'terminated' && p.terminationReason && (
                            <div style={{ 
                              color: "#ef4444", 
                              fontSize: "10px", 
                              marginTop: 4, 
                              fontStyle: "italic",
                              maxWidth: "120px",
                              lineHeight: "1.2"
                            }}>
                              Reason: {p.terminationReason}
                            </div>
                          )}
                                                  </td>
                          <td style={{ padding:"10px 12px" }}>
                            {(user?.role==="admin"||user?.role==="researcher") && (
                              <div style={{ display:"flex", gap:6, flexWrap: "wrap" }}>
                                <Btn small variant="secondary" onClick={()=>{ setSelectedProject(p); setActiveView("timeline"); }}>Timeline</Btn>
                                <Btn small variant="secondary" onClick={()=>{ setSelectedProject(p); setActiveView("milestones"); }}>Milestones</Btn>
                                {(user?.role === "admin" || p.createdBy === user?.id) && (
                                <Btn small variant="secondary" onClick={() => { setSelectedProject(p); setShowExtensionModal(true); }}>⏳ Extend</Btn>
                                   )}
                                
                                {/* 💬 SOCIAL HUB BUTTON ADDED HERE */}
                                <Btn small variant="secondary" onClick={()=>{ setSelectedProject(p); setActiveView("social"); }}>💬 Social</Btn>

                                
                                <Btn small variant="secondary" onClick={()=>{ setSelectedProject(p); setActiveView("gantt"); }}>Gantt</Btn>
                                <Btn small variant="secondary" onClick={()=>{ setSelectedProject(p); setShowBudget(true); }}>💰 Budget</Btn>
                                <Btn small variant="secondary" onClick={()=>{ setSelectedProject(p); setShowEthics(true); }}>🛡️ Ethics</Btn>
                                {(user?.role==="admin" || p.createdBy === user?.id || (p.collaborators && p.collaborators.some(c => typeof c === 'object' ? c.userId === user?.id : c === user?.id))) && (
                                  <Btn small variant="secondary" onClick={()=>openEdit(p)}>Edit</Btn>
                                )}
                                {/* NEW: Terminate Button */}
                                {user?.role === "admin" && p.status !== 'terminated' && (
                                  <Btn small variant="danger" onClick={() => handleTerminate(p._id)}>Terminate</Btn>
                                )}
                                {user?.role==="admin" && <Btn small variant="danger" onClick={()=>handleDelete(p._id)}>Del</Btn>}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </>
          )}

          {/* Project Detail Views (Replaced the table) */}
          {selectedProject && activeView !== "table_view" && (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <button
                  onClick={() => { setActiveView("table_view"); setActiveTab("table_view"); setSelectedProject(null); }}
                  style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: 14 }}
                >
                  ← Back to Projects
                </button>
                <h2 style={{ color: "#e2e8f0", fontSize: 20, fontWeight: 700, margin: 0 }}>
                  {selectedProject.title}
                </h2>
              </div>

              {activeView === "timeline" && (
                <TimelineManager entityType="community" entityId={selectedProject._id} entityTitle={selectedProject.title} />
              )}
              
              {activeView === "milestones" && (
                <MilestoneManager projectId={selectedProject._id} entityType="community" />
              )}

              {/* 💬 RENDERING THE SOCIAL HUB HERE */}
              {activeView === "social" && (
                <ProjectSocialHub 
                  project={selectedProject} 
                  apiBase={getServiceUrl("community")} 
                />
              )}

              {activeView === "gantt" && (
                <GanttChart projects={projects} timelines={timelines} milestones={milestones} entityType="community" />
              )}
            </div>
          )}

          {/* Tab 3: All Community Projects Gantt Chart (Stand-alone tab) */}
          {activeTab === "gantt_chart" && (
            <div style={{ marginTop: 20 }}>
              <SectionCard title="📊 Gantt Chart View - Community Projects">
                <GanttChart
                  projects={projects}
                  timelines={timelines}
                  milestones={milestones}
                  entityType="community"
                  onEdit={(p) => openEdit(p)}
                  onDelete={(id) => handleDelete(id)}
                  canEdit={(p) => user?.role === "admin" || p.createdBy === user?.id || (p.collaborators && p.collaborators.some(c => typeof c === 'object' ? c.userId === user?.id : c === user?.id))}
                  canDelete={(p) => user?.role === "admin"}
                />
              </SectionCard>
            </div>
          )}

          {/* Tab 2: Interactive SVG regional map */}
          {activeTab === "impact_map" && (
            <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }}>
              <SectionCard title="Adama & East Shewa Corridor Outreach Map">
                <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>
                  Hover over active pulsing radar hotspots to analyze regional impact metrics calculated dynamically from live database records.
                </p>
                <div style={{ position: "relative", overflow: "hidden", background: "#090f17", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <svg width="100%" height="400" viewBox="0 0 500 360" style={{ display: "block" }}>
                    <defs>
                      <style>{`
                        @keyframes radarPulse {
                          0% { r: 6px; opacity: 1; stroke-width: 1px; }
                          50% { r: 18px; opacity: 0.4; stroke-width: 2px; }
                          100% { r: 30px; opacity: 0; stroke-width: 1px; }
                        }
                        .radar-glow { animation: radarPulse 2s infinite ease-out; }
                      `}</style>
                    </defs>
                    <path d="M 50,150 Q 150,160 250,220 T 450,280" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 180,50 L 180,190 Q 280,220 380,300" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" strokeLinecap="round" />
                    {Object.entries(LOCATIONS_CONFIG).map(([key, config]) => {
                      const data = getAggregateByLocation(key);
                      return (
                        <g key={key} onMouseEnter={() => setHoveredLocation({ key, config, data })} onMouseLeave={() => setHoveredLocation(null)} style={{ cursor: "pointer" }}>
                          {data.count > 0 && <circle cx={config.cx} cy={config.cy} fill="none" stroke={config.color} className="radar-glow" />}
                          <circle cx={config.cx} cy={config.cy} r={data.count > 0 ? 8 : 4} fill={data.count > 0 ? config.color : "#1e293b"} stroke="#090f17" strokeWidth={1.5} />
                          <text x={config.cx} y={config.cy - 12} fill="#94a3b8" fontSize="9" fontWeight="600" textAnchor="middle" pointerEvents="none">{config.name}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </SectionCard>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <SectionCard title="Impact Dossier">
                  {hoveredLocation ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <h3 style={{ color: hoveredLocation.config.color, fontSize: 16, fontWeight: 700, margin: 0 }}>{hoveredLocation.config.name}</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: 10 }}>
                          <span style={{ color: "#64748b", fontSize: 11, display: "block" }}>Active Outreach</span>
                          <span style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 700 }}>{hoveredLocation.data.count} Projects</span>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: 10 }}>
                          <span style={{ color: "#64748b", fontSize: 11, display: "block" }}>Budget</span>
                          <span style={{ color: "#f59e0b", fontSize: 15, fontWeight: 700 }}>{fmtETB(hoveredLocation.data.budget)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 260, color: "#475569" }}>
                      <span style={{ fontSize: 32 }}>🗺️</span>
                      <span style={{ fontSize: 12 }}>Hover over hotspots for stats</span>
                    </div>
                  )}
                </SectionCard>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals section */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"#162030", borderRadius:16, padding:32, width:"100%", maxWidth:600, border:"1px solid rgba(255,255,255,0.1)", maxHeight:"90vh", overflowY:"auto" }}>
            <h2 style={{ color:"#e2e8f0", fontSize:18, fontWeight:700, marginBottom:24 }}>{editing?"Edit":"Add"} Community Project</h2>
            <form onSubmit={handleSubmit} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {/* Currency and Budget Row - Spans full width */}
  <div style={{ gridColumn: "1/-1", display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}>
    <div>
      <label style={labelStyle}>Currency</label>
      <select 
        value={form.currency} 
        onChange={e => setForm({...form, currency: e.target.value})} 
        style={inputStyle}
      >
        <option value="ETB">ETB (Birr)</option>
        <option value="USD">USD ($)</option>
        <option value="EUR">EUR (€)</option>
      </select>
    </div>
    <div>
      <label style={labelStyle}>Total Budget Amount</label>
      <input 
        type="number" 
        value={form.budgetETB} 
        onChange={e => setForm({...form, budgetETB: e.target.value})} 
        style={inputStyle} 
        placeholder="Enter amount"
      />
    </div>
  </div>

  {/* Document Links - Spans full width */}
  <div style={{ gridColumn: "1/-1" }}>
    <label style={labelStyle}>Data Management Plan (Link)</label>
    <input 
      value={form.dmpUrl} 
      onChange={e => setForm({...form, dmpUrl: e.target.value})} 
      style={inputStyle} 
      placeholder="https://link-to-your-dmp-document.com" 
    />
  </div>

  <div style={{ gridColumn: "1/-1" }}>
    <label style={labelStyle}>Ethics Consent Form (Link)</label>
    <input 
      value={form.consentFormUrl} 
      onChange={e => setForm({...form, consentFormUrl: e.target.value})} 
      style={inputStyle} 
      placeholder="https://link-to-consent-form.com" 
    />
  </div>
               {/* Form inputs would go here... (Keeping existing form logic) */}
               <div style={{ gridColumn:"1/-1", display:"flex", justifyContent:"flex-end", gap:10 }}>
                <Btn variant="secondary" onClick={()=>{setShowForm(false);setEditing(null);}}>Cancel</Btn>
                <Btn>Save Project</Btn>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showBudget && selectedProject && (
        <ExpenditureManager projectId={selectedProject._id} projectTitle={selectedProject.title} budget={selectedProject.budgetETB} onClose={() => { setShowBudget(false); setSelectedProject(null); load(); }} serviceType="community" />
      )}

      {showEthics && selectedProject && (
        <EthicsComplianceManager projectId={selectedProject._id} projectTitle={selectedProject.title} onClose={() => { setShowEthics(false); setSelectedProject(null); load(); }} serviceType="community" />
      )}

      {showNotifications && (
        <NotificationCenter onClose={() => setShowNotifications(false)} serviceType="community" />
      )}

    {/* Extension Request Modal */}
    {showExtensionModal && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#162030", borderRadius: 16, padding: 32, width: "100%", maxWidth: 500, border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 700, marginTop: 0, marginBottom: 20 }}>⏳ Request Project Extension</h2>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Proposed New End Date</label>
            <input type="date" style={inputStyle} onChange={e => setExtensionForm({...extensionForm, newEndDate: e.target.value})} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Justification</label>
            <textarea style={{ ...inputStyle, height: 100, resize: "none" }} placeholder="Why is more time needed?" onChange={e => setExtensionForm({...extensionForm, justification: e.target.value})} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="secondary" onClick={() => setShowExtensionModal(false)}>Cancel</Btn>
            <Btn onClick={submitExtensionRequest}>Submit Request</Btn>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}