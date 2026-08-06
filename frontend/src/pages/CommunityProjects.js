import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { Badge, SectionCard, PageHeader, Btn, Loader, ErrorMsg, fmtETB } from "../components/ui";

import { getServiceUrl } from "../config/api";
import TimelineManager from "../components/ui/TimelineManager";
import MilestoneManager from "../components/ui/MilestoneManager";
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
  const [form,     setForm]     = useState({ title:"", lead:"", college:"", location:"Adama", status:"active", startDate:"", endDate:"", budgetETB:0, beneficiaries:0, volunteers:0, tags:"", summary:"", impact:"", collaborators:[], department:"", centerOfExcellence:"None", fundingSource:"ASTU Internal", publications:0, teamSize:1, externalLink:"" });
  const [allResearchers, setAllResearchers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeView, setActiveView] = useState("table_view"); // "table_view", "timeline", "milestones", "gantt"
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
  // Coordinates in East Shewa district orbital network
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
                          <td style={{ padding:"10px 12px" }}><Badge status={p.status} /></td>
                          <td style={{ padding:"10px 12px" }}>
                            {(user?.role==="admin"||user?.role==="researcher") && (
                              <div style={{ display:"flex", gap:6 }}>
                                <Btn small variant="secondary" onClick={()=>{ setSelectedProject(p); setActiveView("timeline"); }}>Timeline</Btn>
                                <Btn small variant="secondary" onClick={()=>{ setSelectedProject(p); setActiveView("milestones"); }}>Milestones</Btn>
                                <Btn small variant="secondary" onClick={()=>{ setSelectedProject(p); setActiveView("gantt"); }}>Gantt</Btn>
                                <Btn small variant="secondary" onClick={()=>{ setSelectedProject(p); setShowBudget(true); }}>💰 Budget</Btn>
                                <Btn small variant="secondary" onClick={()=>{ setSelectedProject(p); setShowEthics(true); }}>🛡️ Ethics</Btn>
                                {/* Show Edit only if owner, collaborator, or admin */}
                                {(user?.role==="admin" || p.createdBy === user?.id || (p.collaborators && p.collaborators.some(c => typeof c === 'object' ? c.userId === user?.id : c === user?.id))) && (
                                  <Btn small variant="secondary" onClick={()=>openEdit(p)}>Edit</Btn>
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

          {/* Timeline View */}
          {activeView === "timeline" && selectedProject && (
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
              <TimelineManager
                entityType="community"
                entityId={selectedProject._id}
                entityTitle={selectedProject.title}
              />
            </div>
          )}

          {activeView === "milestones" && selectedProject && (
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
              <MilestoneManager
                projectId={selectedProject._id}
                entityType="community"
              />
            </div>
          )}

          {activeView === "gantt" && selectedProject && (
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
              <GanttChart
                projects={projects}
                timelines={timelines}
                milestones={milestones}
                entityType="community"
              />
            </div>
          )}

          {/* Tab 3: All Community Projects Gantt Chart */}
          {activeTab === "gantt_chart" && (
            <div style={{ marginTop: 20 }}>
              <SectionCard title="📊 Gantt Chart View - Community Projects">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ color: "#64748b", fontSize: 13 }}>
                    {projects.length} total projects · Gantt & Timeline View
                  </div>
                </div>
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
              {/* Map view */}
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
                        .radar-glow {
                          animation: radarPulse 2s infinite ease-out;
                        }
                      `}</style>
                    </defs>

                    {/* East Shewa styled grid paths (stylized highway and river boundaries) */}
                    <path d="M 50,150 Q 150,160 250,220 T 450,280" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 50,150 Q 150,160 250,220 T 450,280" fill="none" stroke="rgba(34,211,238,0.04)" strokeWidth="2" strokeLinecap="round" />
                    
                    <path d="M 180,50 L 180,190 Q 280,220 380,300" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" strokeLinecap="round" />

                    {/* Plot coordinates beacons */}
                    {Object.entries(LOCATIONS_CONFIG).map(([key, config]) => {
                      const data = getAggregateByLocation(key);
                      return (
                        <g
                          key={key}
                          onMouseEnter={() => setHoveredLocation({ key, config, data })}
                          onMouseLeave={() => setHoveredLocation(null)}
                          style={{ cursor: "pointer" }}>
                          
                          {/* Radar waves */}
                          {data.count > 0 && (
                            <circle
                              cx={config.cx}
                              cy={config.cy}
                              fill="none"
                              stroke={config.color}
                              className="radar-glow"
                            />
                          )}

                          <circle
                            cx={config.cx}
                            cy={config.cy}
                            r={data.count > 0 ? 8 : 4}
                            fill={data.count > 0 ? config.color : "#1e293b"}
                            stroke="#090f17"
                            strokeWidth={1.5}
                          />

                          <text
                            x={config.cx}
                            y={config.cy - 12}
                            fill="#94a3b8"
                            fontSize="9"
                            fontWeight="600"
                            textAnchor="middle"
                            pointerEvents="none">
                            {config.name}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </SectionCard>

              {/* Dynamic stats sidebar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <SectionCard title="Impact Dossier">
                  {hoveredLocation ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <div>
                        <h3 style={{ color: hoveredLocation.config.color, fontSize: 16, fontWeight: 700, margin: 0 }}>{hoveredLocation.config.name}</h3>
                        <p style={{ color: "#64748b", fontSize: 12, margin: "2px 0 0" }}>East Shewa Development Grid</p>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: 10 }}>
                          <span style={{ color: "#64748b", fontSize: 11, display: "block" }}>Active Outreach</span>
                          <span style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 700 }}>{hoveredLocation.data.count} Projects</span>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: 10 }}>
                          <span style={{ color: "#64748b", fontSize: 11, display: "block" }}>Allocated Budget</span>
                          <span style={{ color: "#f59e0b", fontSize: 15, fontWeight: 700, fontFamily: "monospace" }}>{fmtETB(hoveredLocation.data.budget)}</span>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: 10 }}>
                          <span style={{ color: "#64748b", fontSize: 11, display: "block" }}>Beneficiaries</span>
                          <span style={{ color: "#34d399", fontSize: 18, fontWeight: 700 }}>{hoveredLocation.data.beneficiaries.toLocaleString()}</span>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: 10 }}>
                          <span style={{ color: "#64748b", fontSize: 11, display: "block" }}>Student Vols</span>
                          <span style={{ color: "#38bdf8", fontSize: 18, fontWeight: 700 }}>{hoveredLocation.data.volunteers.toLocaleString()}</span>
                        </div>
                      </div>

                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
                        <span style={{ color: "#475569", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 6 }}>Outreach Projects</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 110, overflowY: "auto" }}>
                          {hoveredLocation.data.list.map((title, idx) => (
                            <div key={idx} style={{ color: "#94a3b8", fontSize: 11.5, borderLeft: `2px solid ${hoveredLocation.config.color}`, paddingLeft: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={title}>
                              {title}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 260, color: "#475569" }}>
                      <span style={{ fontSize: 32, marginBottom: 12 }}>🗺️</span>
                      <span style={{ fontSize: 12, textAlign: "center" }}>Hover over map coordinate indicators to load dynamic regional stats.</span>
                    </div>
                  )}
                </SectionCard>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"#162030", borderRadius:16, padding:32, width:"100%", maxWidth:600, border:"1px solid rgba(255,255,255,0.1)", maxHeight:"90vh", overflowY:"auto" }}>
            <h2 style={{ color:"#e2e8f0", fontSize:18, fontWeight:700, marginTop:0, marginBottom:24 }}>{editing?"Edit":"Add"} Community Project</h2>
            
            {saveMsg && (
              <div style={{ background: saveMsg.startsWith("✅") ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${saveMsg.startsWith("✅") ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: saveMsg.startsWith("✅") ? "#4ade80" : "#f87171", fontSize: 13 }}>
                {saveMsg}
              </div>
            )}
            
            <form onSubmit={handleSubmit} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display:"block", color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:".05em" }}>Project Title *</label>
                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ width:"100%", background:"#0f1824", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} placeholder="e.g. Community Health Outreach Program" />
              </div>

              <div>
                <label style={{ display:"block", color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:".05em" }}>Lead Researcher *</label>
                <input required value={form.lead} onChange={e => setForm(f => ({ ...f, lead: e.target.value }))} style={{ width:"100%", background:"#0f1824", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} placeholder="e.g. Dr. Alemu Bekele" />
              </div>

              <div>
                <label style={{ display:"block", color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:".05em" }}>Institutional College *</label>
                <select required value={form.college} onChange={e => setForm(f => ({ ...f, college: e.target.value }))} style={{ width:"100%", background:"#0f1824", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}>
                  <option value="">Select College</option>
                  {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display:"block", color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:".05em" }}>Center of Excellence Partnership</label>
                <select value={form.centerOfExcellence} onChange={e => setForm(f => ({ ...f, centerOfExcellence: e.target.value }))} style={{ width:"100%", background:"#0f1824", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}>
                  {CENTERS_OF_EXCELLENCE.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display:"block", color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:".05em" }}>Department</label>
                <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} style={{ width:"100%", background:"#0f1824", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} placeholder="e.g. Public Health" />
              </div>

              <div>
                <label style={{ display:"block", color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:".05em" }}>Location</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} style={{ width:"100%", background:"#0f1824", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} placeholder="e.g. Adama" />
              </div>

              <div>
                <label style={{ display:"block", color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:".05em" }}>State / Stage</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ width:"100%", background:"#0f1824", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}>
                  {["active", "paused", "completed", "planned"].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display:"block", color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:".05em" }}>Funding Allocation (ETB)</label>
                <input type="number" min="0" value={form.budgetETB} onChange={e => setForm(f => ({ ...f, budgetETB: e.target.value }))} style={{ width:"100%", background:"#0f1824", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
              </div>

              <div>
                <label style={{ display:"block", color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:".05em" }}>Funding Sponsor</label>
                <input value={form.fundingSource} onChange={e => setForm(f => ({ ...f, fundingSource: e.target.value }))} style={{ width:"100%", background:"#0f1824", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} placeholder="e.g. ASTU Internal" />
              </div>

              <div>
                <label style={{ display:"block", color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:".05em" }}>Start Date</label>
                <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} style={{ width:"100%", background:"#0f1824", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
              </div>

              <div>
                <label style={{ display:"block", color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:".05em" }}>End Date</label>
                <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} style={{ width:"100%", background:"#0f1824", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
              </div>

              <div>
                <label style={{ display:"block", color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:".05em" }}>Beneficiaries</label>
                <input type="number" min="0" value={form.beneficiaries} onChange={e => setForm(f => ({ ...f, beneficiaries: e.target.value }))} style={{ width:"100%", background:"#0f1824", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
              </div>

              <div>
                <label style={{ display:"block", color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:".05em" }}>Volunteers</label>
                <input type="number" min="0" value={form.volunteers} onChange={e => setForm(f => ({ ...f, volunteers: e.target.value }))} style={{ width:"100%", background:"#0f1824", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
              </div>

              <div>
                <label style={{ display:"block", color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:".05em" }}>Publications</label>
                <input type="number" min="0" value={form.publications} onChange={e => setForm(f => ({ ...f, publications: e.target.value }))} style={{ width:"100%", background:"#0f1824", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
              </div>

              <div>
                <label style={{ display:"block", color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:".05em" }}>Team Size</label>
                <input type="number" min="1" value={form.teamSize} onChange={e => setForm(f => ({ ...f, teamSize: e.target.value }))} style={{ width:"100%", background:"#0f1824", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
              </div>

              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display:"block", color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:".05em" }}>Tags / Focus Areas (comma separated)</label>
                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} style={{ width:"100%", background:"#0f1824", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} placeholder="e.g. health, outreach, education" />
              </div>

              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display:"block", color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:".05em" }}>Project Summary</label>
                <textarea value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} rows={3} style={{ width:"100%", background:"#0f1824", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit", resize:"vertical", boxSizing:"border-box" }} placeholder="Brief description of the community project goal..." />
              </div>

              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display:"block", color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:".05em" }}>Impact Description</label>
                <textarea value={form.impact} onChange={e => setForm(f => ({ ...f, impact: e.target.value }))} rows={3} style={{ width:"100%", background:"#0f1824", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit", resize:"vertical", boxSizing:"border-box" }} placeholder="Describe the expected impact on the community..." />
              </div>

              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display:"block", color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:".05em" }}>External Link</label>
                <input value={form.externalLink} onChange={e => setForm(f => ({ ...f, externalLink: e.target.value }))} style={{ width:"100%", background:"#0f1824", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} placeholder="https://..." />
              </div>

              <AICopilotPanel
                title={form.title}
                summary={form.summary}
                college={form.college}
                department={form.department}
              />

              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display:"block", color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:".05em" }}>Collaborators (Select other researchers and set priority)</label>
                <div style={{ 
                  background: "#0f1824", 
                  border: "1px solid rgba(255,255,255,0.1)", 
                  borderRadius: 8, 
                  padding: 12, 
                  maxHeight: 200, 
                  overflowY: "auto" 
                }}>
                  {allResearchers.map(r => {
                    const isOwner = editing ? (editing.createdBy === r._id) : (user?.id === r._id);
                    if (isOwner) return null;
                    
                    const existingCollab = form.collaborators && form.collaborators.find(c => 
                      typeof c === 'object' ? c.userId === r._id : c === r._id
                    );
                    const isChecked = !!existingCollab;
                    const priority = existingCollab && typeof existingCollab === 'object' ? existingCollab.priority : 'medium';
                    
                    return (
                      <div key={r._id} style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: "1px solid rgba(255,255,255,0.05)"
                      }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#e2e8f0", fontSize: 12, cursor: "pointer" }}>
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setForm(f => {
                                const collabs = f.collaborators || [];
                                if (checked) {
                                  return {
                                    ...f,
                                    collaborators: [...collabs, { userId: r._id, priority: 'medium' }]
                                  };
                                } else {
                                  return {
                                    ...f,
                                    collaborators: collabs.filter(c => 
                                      typeof c === 'object' ? c.userId !== r._id : c !== r._id
                                    )
                                  };
                                }
                              });
                            }}
                          />
                          {r.name}
                        </label>
                        {isChecked && (
                          <select
                            value={priority}
                            onChange={(e) => {
                              setForm(f => {
                                const collabs = f.collaborators || [];
                                return {
                                  ...f,
                                  collaborators: collabs.map(c => {
                                    if (typeof c === 'object' && c.userId === r._id) {
                                      return { ...c, priority: e.target.value };
                                    }
                                    return c;
                                  })
                                };
                              });
                            }}
                            style={{ 
                              background: "#162030", 
                              border: "1px solid rgba(255,255,255,0.1)", 
                              borderRadius: 4, 
                              padding: "4px 8px", 
                              color: "#94a3b8", 
                              fontSize: 11, 
                              outline: "none" 
                            }}
                          >
                            <option value="high">High Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="low">Low Priority</option>
                          </select>
                        )}
                      </div>
                    );
                  })}
                  {allResearchers.filter(r => editing ? (editing.createdBy !== r._id) : (user?.id !== r._id)).length === 0 && (
                    <div style={{ color: "#64748b", fontSize: 12 }}>No other researchers found.</div>
                  )}
                </div>
              </div>

              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display:"block", color:"#94a3b8", fontSize:11, fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:".05em" }}>File Attachments (PDF, Images, Documents - Max 10MB each)</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    setAttachments(files);
                  }}
                  style={{ width:"100%", background:"#0f1824", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}
                />
                {attachments.length > 0 && (
                  <div style={{ marginTop: 8, color: "#22d3ee", fontSize: 12 }}>
                    {attachments.length} file(s) selected: {attachments.map(f => f.name).join(", ")}
                  </div>
                )}
                {editing && editing.attachments && editing.attachments.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Existing Attachments:</div>
                    {editing.attachments.map((att, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", borderRadius: 6, padding: "8px 12px", marginBottom: 6 }}>
                        <span style={{ color: "#e2e8f0", fontSize: 12 }}>📎 {att.originalName}</span>
                        <a
                          href={`${API}/uploads/${att.filename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#22d3ee", fontSize: 11, textDecoration: "none" }}
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ gridColumn:"1/-1", display:"flex", justifyContent:"flex-end", gap:10, marginTop:8 }}>
                <Btn variant="secondary" onClick={()=>{setShowForm(false);setEditing(null);}}>Cancel</Btn>
                <Btn>Save Project</Btn>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Budget & Expenditure Manager Modal */}
      {showBudget && selectedProject && (
        <ExpenditureManager
          projectId={selectedProject._id}
          projectTitle={selectedProject.title}
          budget={selectedProject.budgetETB}
          onClose={() => { setShowBudget(false); setSelectedProject(null); load(); }}
          serviceType="community"
        />
      )}

      {/* Ethics & Compliance Manager Modal */}
      {showEthics && selectedProject && (
        <EthicsComplianceManager
          projectId={selectedProject._id}
          projectTitle={selectedProject.title}
          onClose={() => { setShowEthics(false); setSelectedProject(null); load(); }}
          serviceType="community"
        />
      )}

      {/* Notification Center Modal */}
      {showNotifications && (
        <NotificationCenter 
          onClose={() => setShowNotifications(false)} 
          serviceType="community"
        />
      )}
    </div>
  );
}
