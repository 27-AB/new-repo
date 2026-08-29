// frontend/src/pages/Researchers.js
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getServiceUrl } from "../config/api";

const API = getServiceUrl("college");

export default function ResearchersPage() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // form state (used for both add and edit)
  const emptyForm = { name: "", title: "Dr.", college: "", department: "", email: "", specialization: "", publications: 0, activeProjects: 0, bio: "" };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: 500 });
      const res = await fetch(`${API}/colleges/researchers?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Failed to load researchers (${res.status})`);
      const data = await res.json();
      setResearchers(data.researchers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const submitCreate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        ...form,
        specialization: (form.specialization || "").split(",").map(s => s.trim()).filter(Boolean),
        publications: Number(form.publications) || 0,
        activeProjects: Number(form.activeProjects) || 0
      };
      const res = await fetch(`${API}/colleges/researchers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const text = await res.text().catch(()=>null);
        throw new Error(`Create failed (${res.status}) ${text ? "- " + text : ""}`);
      }
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (r) => {
    setEditingId(r._id);
    setForm({
      name: r.name || "",
      title: r.title || "Dr.",
      college: r.college || "",
      department: r.department || "",
      email: r.email || "",
      specialization: (r.specialization || []).join(", "),
      publications: r.publications || 0,
      activeProjects: r.activeProjects || 0,
      bio: r.bio || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setError(null);
    try {
      const payload = {
        ...form,
        specialization: (form.specialization || "").split(",").map(s => s.trim()).filter(Boolean),
        publications: Number(form.publications) || 0,
        activeProjects: Number(form.activeProjects) || 0
      };
      const res = await fetch(`${API}/colleges/researchers/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const text = await res.text().catch(()=>null);
        throw new Error(`Update failed (${res.status}) ${text ? "- " + text : ""}`);
      }
      setEditingId(null);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelEdit = () => { setEditingId(null); setForm(emptyForm); setError(null); };

  const handleDelete = async (id) => {
    if (!confirm("Delete this researcher?")) return;
    try {
      const res = await fetch(`${API}/colleges/researchers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading researchers…</div>;

  const totalPublications = researchers.reduce((s, r) => s + (r.publications || 0), 0);

  return (
    <div style={{ maxWidth: 1100 }}>
      <h1 style={{ marginBottom: 6 }}>Researchers & Faculty</h1>
      <p style={{ color: "#94a3b8", marginTop: 0 }}>{researchers.length} active researchers • {totalPublications} total publications</p>

      {error && <div style={{ color: "salmon", marginBottom: 12 }}>{error}</div>}

      {isAdmin && (
        <section style={{ marginBottom: 20, padding: 12, borderRadius: 8, background: "var(--bg-secondary)" }}>
          <h3 style={{ marginTop: 0 }}>{editingId ? "Edit researcher" : "Add researcher"}</h3>
          <form onSubmit={editingId ? submitEdit : submitCreate} style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
            <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
            <input name="title" placeholder="Title" value={form.title} onChange={handleChange} />
            <input name="college" placeholder="College" value={form.college} onChange={handleChange} />
            <input name="department" placeholder="Department" value={form.department} onChange={handleChange} />
            <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
            <input name="specialization" placeholder="Specialization (comma separated)" value={form.specialization} onChange={handleChange} />
            <input name="publications" type="number" placeholder="Publications" value={form.publications} onChange={handleChange} />
            <input name="activeProjects" type="number" placeholder="Active projects" value={form.activeProjects} onChange={handleChange} />
            <textarea name="bio" placeholder="Short bio" value={form.bio} onChange={handleChange} style={{ gridColumn: "1 / -1", minHeight: 80 }} />
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
              <button type="submit" style={{ padding: "8px 12px" }}>{editingId ? "Save" : "Add researcher"}</button>
              {editingId && <button type="button" onClick={cancelEdit} style={{ padding: "8px 12px" }}>Cancel</button>}
            </div>
          </form>
        </section>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {researchers.map(r => (
          <div key={r._id} style={{ padding: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,0.03)", display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 700 }}>{r.title} {r.name}</div>
              <div style={{ color: "#94a3b8" }}>{r.department} • {r.college}</div>
              <div style={{ marginTop: 6 }}>{(r.specialization || []).join(", ")}</div>
              <div style={{ marginTop: 6, color: "#9ca3af" }}>Publications: {r.publications || 0} • Active projects: {r.activeProjects || 0}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
              {isAdmin && <button onClick={() => startEdit(r)} style={{ background: "transparent" }}>Edit</button>}
              {isAdmin && <button onClick={() => handleDelete(r._id)} style={{ background: "transparent", color: "#ef4444" }}>Delete</button>}
              <a href={`mailto:${r.email}`} style={{ color: "#60a5fa", fontSize: 12 }}>{r.email}</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
