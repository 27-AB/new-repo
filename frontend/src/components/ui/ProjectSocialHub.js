import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Btn, SectionCard } from "./index";

export default function ProjectSocialHub({ project, apiBase }) {
  const { token } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newLink, setNewLink] = useState({ title: "", url: "", type: "Publication" });

  const fetchComments = async () => {
    try {
      const res = await fetch(`${apiBase}/projects/${project._id}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setComments(data.comments);
    } catch (e) { console.error("Comment fetch error", e); }
  };

  useEffect(() => { fetchComments(); }, [project._id]);

  const postComment = async () => {
    if (!newComment.trim()) return;
    await fetch(`${apiBase}/projects/${project._id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ projectId: project._id, text: newComment }),
    });
    setNewComment("");
    fetchComments();
  };

  const addOutputLink = async () => {
    if (!newLink.title || !newLink.url) return;
    // We update the project directly
    const updatedOutputs = [...(project.outputs || []), newLink];
    try {
        await fetch(`${apiBase}/projects/${project._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ outputs: updatedOutputs }),
        });
        window.location.reload(); // Refresh to show new link
    } catch (e) { alert("Failed to add link"); }
  };

  const downloadCalendarEvent = () => {
    const event = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `SUMMARY:Deadline: ${project.title}`,
      `DTSTART:${project.endDate?.replace(/-/g, '') || '20261231'}T090000Z`,
      `DESCRIPTION:Research project deadline for ${project.title}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\n");
    const blob = new Blob([event], { type: "text/calendar" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${project.title}.ics`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
      {/* 💬 COMMUNICATION HUB */}
      <SectionCard title="💬 Communication Hub">
        <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 10, padding: 10, background: "#06090e", borderRadius: 8 }}>
          {comments.length > 0 ? comments.map((c, i) => (
            <div key={i} style={{ marginBottom: 12, borderBottom: "1px solid #1e293b", paddingBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <small style={{ color: "#22d3ee", fontWeight: "bold" }}>{c.userName}</small>
                <small style={{ color: "#475569" }}>{new Date(c.createdAt).toLocaleDateString()}</small>
              </div>
              <p style={{ fontSize: 13, margin: "4px 0 0 0", color: "#e2e8f0" }}>{c.text}</p>
            </div>
          )) : <p style={{ color: "#475569", fontSize: 12 }}>No messages yet. Start the discussion!</p>}
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          <input 
            value={newComment} onChange={(e) => setNewComment(e.target.value)}
            placeholder="Discuss revisions or updates..."
            style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "white" }}
          />
          <Btn small onClick={postComment}>Post</Btn>
        </div>
      </SectionCard>

      {/* 🔗 OUTPUTS & CALENDAR */}
      <SectionCard title="🔗 Project Outputs (DOI / Patents)">
        <div style={{ marginBottom: 20 }}>
            {project.outputs?.map((o, i) => (
                <div key={i} style={{ padding: 8, background: "rgba(34,211,238,0.05)", borderRadius: 6, marginBottom: 5 }}>
                    <small style={{ color: "#94a3b8" }}>{o.type}</small>
                    <a href={o.url} target="_blank" rel="noreferrer" style={{ color: "#22d3ee", display: "block", fontSize: 14, fontWeight: "500" }}>{o.title}</a>
                </div>
            ))}

            <div style={{ marginTop: 15, padding: 10, border: "1px dashed #334155", borderRadius: 8 }}>
                <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>ADD NEW LINK:</p>
                <input 
                    placeholder="Title (e.g. Nature Paper)" 
                    style={{ width: "100%", padding: 6, marginBottom: 5, background: "transparent", border: "1px solid #334155", color: "white", fontSize: 12 }}
                    onChange={e => setNewLink({...newLink, title: e.target.value})}
                />
                <input 
                    placeholder="URL / DOI Link" 
                    style={{ width: "100%", padding: 6, marginBottom: 5, background: "transparent", border: "1px solid #334155", color: "white", fontSize: 12 }}
                    onChange={e => setNewLink({...newLink, url: e.target.value})}
                />
                <Btn small variant="secondary" onClick={addOutputLink}>Save Link</Btn>
            </div>
        </div>
        
        <div style={{ borderTop: "1px solid #334155", paddingTop: 15 }}>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>EXTERNAL TOOLS:</p>
            <Btn variant="primary" onClick={downloadCalendarEvent} style={{ width: "100%" }}>
                📅 Sync Deadline to Mobile/Outlook
            </Btn>
        </div>
      </SectionCard>
    </div>
  );
}