import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Loader, ErrorMsg } from "../components/ui";

import { getServiceUrl } from "../config/api";
import TimelineManager from "../components/ui/TimelineManager";
import MilestoneManager from "../components/ui/MilestoneManager";
import GanttChart from "../components/ui/GanttChart";

const API = getServiceUrl("college");

export default function Colleges() {
  const { token } = useAuth();
  const [colleges, setColleges] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [activeView, setActiveView] = useState("list"); // "list", "timeline", "milestones", "gantt"
  const [timelines, setTimelines] = useState([]);
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    fetch(`${API}/colleges`, { headers:{ Authorization:`Bearer ${token}` }})
      .then(r=>r.json()).then(d=>setColleges(d.colleges||[]))
      .catch(e=>setError(e.message)).finally(()=>setLoading(false));
  }, [token]);

  // Load timelines for Gantt chart
  const loadTimelines = async () => {
    try {
      const res = await fetch(`${API}/timeline/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTimelines(Array.isArray(data.timelineItems) ? data.timelineItems : Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Error loading timelines:", e);
    }
  };

  // Load milestones for colleges
  const loadMilestones = async () => {
    try {
      const res = await fetch(`${API}/milestones/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMilestones(data || []);
      }
    } catch (e) {
      console.error("Error loading milestones:", e);
    }
  };

  // Load timeline and milestone data when switching to relevant views
  useEffect(() => {
    if (activeView === "gantt" || activeView === "milestones") {
      loadTimelines();
      loadMilestones();
    }
  }, [activeView, token]);

  const handleSeed = async () => {
    await fetch(`${API}/seed`, { method:"POST", headers:{ Authorization:`Bearer ${token}` }});
    window.location.reload();
  };

  if (loading) return <Loader />;
  if (error)   return <ErrorMsg message={error} />;

  return (
    <div>
      <PageHeader title="Colleges & Institutes" sub={`${colleges.length} colleges at Adama Science and Technology University`}
        actions={colleges.length===0 && <button onClick={handleSeed} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 16px", color:"#94a3b8", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Seed Colleges</button>}
      />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:18 }}>
        {colleges.map(col => (
          <div key={col._id} style={{ background:"#162030", border:`1px solid ${col.color}30`, borderRadius:14, padding:24, position:"relative", overflow:"hidden", transition:"transform .2s, border-color .2s", cursor:"default" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.borderColor=`${col.color}60`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.borderColor=`${col.color}30`;}}>

            {/* Color bar top */}
            <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:`linear-gradient(90deg,${col.color},${col.color}80)`, borderRadius:"14px 14px 0 0" }} />

            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14 }}>
              <div style={{ width:46, height:46, borderRadius:12, background:`${col.color}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🏛️</div>
              <span style={{ background:`${col.color}20`, color:col.color, padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:700 }}>{col.shortName}</span>
            </div>

            <h3 style={{ color:"#e2e8f0", fontSize:15, fontWeight:700, margin:"0 0 6px", lineHeight:1.3 }}>{col.name}</h3>
            <p style={{ color:"#64748b", fontSize:12, margin:"0 0 12px" }}>Dean: {col.dean} · Est. {col.established}</p>
            <p style={{ color:"#94a3b8", fontSize:12, margin:"0 0 14px", lineHeight:1.6 }}>{col.description}</p>

            <div>
              <p style={{ color:"#475569", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:".05em", marginBottom:8 }}>Departments</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {(col.departments||[]).map(d=>(
                  <span key={d} style={{ background:"rgba(255,255,255,0.05)", color:"#94a3b8", padding:"3px 8px", borderRadius:6, fontSize:11 }}>{d}</span>
                ))}
              </div>
            </div>
            
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => { setSelectedCollege(col); setActiveView("timeline"); }}
                  style={{
                    flex: 1,
                    background: col.color + "20",
                    border: "1px solid " + col.color + "40",
                    borderRadius: 8,
                  padding: "8px 16px",
                  color: col.color,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit"
                }}
              >
                View Timeline
              </button>
                <button
                  onClick={() => { setSelectedCollege(col); setActiveView("milestones"); }}
                  style={{
                    flex: 1,
                    background: col.color + "20",
                    border: "1px solid " + col.color + "40",
                    borderRadius: 8,
                    padding: "8px 16px",
                    color: col.color,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit"
                  }}
                >
                  Milestones
                </button>
                <button
                  onClick={() => { setSelectedCollege(col); setActiveView("gantt"); }}
                  style={{
                    flex: 1,
                    background: col.color + "20",
                    border: "1px solid " + col.color + "40",
                    borderRadius: 8,
                    padding: "8px 16px",
                    color: col.color,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit"
                  }}
                >
                  Gantt Chart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline View */}
      {activeView === "timeline" && selectedCollege && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <button
              onClick={() => { setActiveView("list"); setSelectedCollege(null); }}
              style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: 14 }}
            >
              ← Back to Colleges
            </button>
            <h2 style={{ color: "#e2e8f0", fontSize: 20, fontWeight: 700, margin: 0 }}>
              {selectedCollege.name}
            </h2>
          </div>
          <TimelineManager
            entityType="college"
            entityId={selectedCollege._id}
            entityTitle={selectedCollege.name}
          />
        </div>
      )}

      {/* Milestones View */}
      {activeView === "milestones" && selectedCollege && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <button
              onClick={() => { setActiveView("list"); setSelectedCollege(null); }}
              style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: 14 }}
            >
              ← Back to Colleges
            </button>
            <h2 style={{ color: "#e2e8f0", fontSize: 20, fontWeight: 700, margin: 0 }}>
              {selectedCollege.name}
            </h2>
          </div>
          <MilestoneManager
            projectId={selectedCollege._id}
            entityType="college"
          />
        </div>
      )}

      {/* Gantt Chart View */}
      {activeView === "gantt" && selectedCollege && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <button
              onClick={() => { setActiveView("list"); setSelectedCollege(null); }}
              style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: 14 }}
            >
              ← Back to Colleges
            </button>
            <h2 style={{ color: "#e2e8f0", fontSize: 20, fontWeight: 700, margin: 0 }}>
              {selectedCollege.name}
            </h2>
          </div>
          <GanttChart
            projects={[selectedCollege].map(col => ({
              ...col,
              title: col.name,
              startDate: col.established || new Date().toISOString(),
              endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
            }))}
            timelines={timelines}
            milestones={milestones}
            entityType="college"
          />
        </div>
      )}
    </div>
  );
}
