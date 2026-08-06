import React, { useState, useEffect, useMemo } from 'react';

// ─── Inline style constants ────────────────────────────────────────────────────
const DARK = '#0d1b2a';
const SURFACE = '#162030';
const BORDER = 'rgba(255,255,255,0.07)';
const ACCENT = '#22d3ee';

const STATUS = {
  pending:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Pending',     icon: '⏳' },
  'in-progress':{ color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)', label: 'In Progress', icon: '🔄' },
  completed:   { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Completed',   icon: '✅' },
  overdue:     { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  label: 'Overdue',     icon: '🚨' },
};

const PRIORITY = {
  low:      { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   label: 'Low'      },
  medium:   { color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)',  label: 'Medium'   },
  high:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: 'High'     },
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   label: 'Critical' },
};

const MILESTONE_TYPES = [
  'First Quarter Report','Mid-term Review','Final Lab Test',
  'Phase 1 Completion','Phase 2 Completion','Documentation',
  'Review Meeting','Other'
];

const inputStyle = {
  width: '100%', background: '#0f1824',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: '9px 12px',
  color: '#e2e8f0', fontSize: 13,
  outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box', transition: 'border-color .15s',
};
const labelStyle = {
  display: 'block', color: '#94a3b8', fontSize: 11,
  fontWeight: 600, marginBottom: 5,
  textTransform: 'uppercase', letterSpacing: '.05em',
};

// ─── Helper ────────────────────────────────────────────────────────────────────
const fmt = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const daysRemaining = (due) => Math.ceil((new Date(due) - new Date()) / 86400000);
const daysLate = (due, completed) => {
  if (!completed) return 0;
  return Math.ceil((new Date(completed) - new Date(due)) / 86400000);
};

// ─── Visual Timeline Rail ──────────────────────────────────────────────────────
function MilestoneRail({ milestones }) {
  if (!milestones.length) return null;
  const sorted = [...milestones].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const first  = new Date(sorted[0].dueDate);
  const last   = new Date(sorted[sorted.length - 1].dueDate);
  const totalMs = last - first || 1;

  return (
    <div style={{ padding: '20px 28px', background: 'rgba(255,255,255,0.015)', borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ color: '#475569', fontSize: 11, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 16 }}>
        Timeline Rail
      </div>
      <div style={{ position: 'relative', height: 60 }}>
        {/* Track line */}
        <div style={{
          position: 'absolute', top: 18, left: 0, right: 0, height: 3,
          background: 'rgba(255,255,255,0.06)', borderRadius: 2,
        }} />
        {/* Diamonds */}
        {sorted.map((m, i) => {
          const pct = totalMs > 0 ? ((new Date(m.dueDate) - first) / totalMs) * 100 : 0;
          const s   = STATUS[m.status] || STATUS.pending;
          const late = m.completionDate ? daysLate(m.dueDate, m.completionDate) : 0;
          return (
            <div key={m._id} style={{ position: 'absolute', left: `${pct}%`, transform: 'translateX(-50%)' }}>
              {/* Diamond marker */}
              <div
                style={{
                  width: 18, height: 18, transform: 'rotate(45deg)',
                  background: s.color, border: `3px solid ${DARK}`,
                  boxShadow: `0 0 12px ${s.color}50`,
                  position: 'relative', zIndex: 2,
                }}
                title={`${m.title === 'Other' ? m.customTitle : m.title} — Due: ${fmt(m.dueDate)}`}
              />
              {/* Label below */}
              <div style={{
                position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
                whiteSpace: 'nowrap', fontSize: 10, color: s.color, fontWeight: 700,
                textAlign: 'center', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {m.title === 'Other' ? m.customTitle : m.title}
                {late > 0 && <div style={{ color: '#ef4444', fontSize: 9 }}>+{late}d late</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Progress Ring ─────────────────────────────────────────────────────────────
function ProgressRing({ pct, color, size = 44 }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
              strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
              style={{ transition: 'stroke-dasharray .5s ease' }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
            style={{ fontSize: 11, fontWeight: 700, fill: color, transform: 'rotate(90deg)', transformOrigin: 'center' }}>
        {pct}%
      </text>
    </svg>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, icon }) {
  return (
    <div style={{
      background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12,
      padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 140px',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
      }}>{icon}</div>
      <div>
        <div style={{ color: '#475569', fontSize: 11, fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
        <div style={{ color: color || '#e2e8f0', fontSize: 22, fontWeight: 700, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
const MilestoneManager = ({ projectId, entityType = 'research' }) => {
  const [milestones,  setMilestones]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [search,      setSearch]      = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy,      setSortBy]      = useState('dueDate');
  const [error,       setError]       = useState('');
  const [saving,      setSaving]      = useState(false);
  const [showCustom,  setShowCustom]  = useState(false);

  const apiBase = entityType === 'community'
    ? 'http://localhost:4002/milestones'
    : entityType === 'college'
    ? 'http://localhost:4003/milestones'
    : 'http://localhost:4001/milestones';

  const load = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/project/${projectId}`);
      if (res.ok) setMilestones(await res.json());
    } catch (e) {
      setError('Could not load milestones');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (projectId) load(); }, [projectId, entityType]);

  // ── Form submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    const fd = new FormData(e.target);
    const data = {
      projectId,
      title:          fd.get('title'),
      customTitle:    fd.get('customTitle') || '',
      description:    fd.get('description') || '',
      dueDate:        fd.get('dueDate'),
      priority:       fd.get('priority'),
      assignedTo:     fd.get('assignedTo') || '',
      resourcesNeeded:fd.get('resourcesNeeded') || '',
      progress:       editing ? parseInt(fd.get('progress')) || 0 : 0,
    };
    try {
      const res = await fetch(editing ? `${apiBase}/${editing._id}` : apiBase, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Save failed'); }
      setShowModal(false); setEditing(null);
      load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleComplete = async (id) => {
    try {
      await fetch(`${apiBase}/${id}/complete`, { method: 'POST' });
      load();
    } catch { setError('Could not complete milestone'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this milestone?')) return;
    try {
      await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
      load();
    } catch { setError('Could not delete milestone'); }
  };

  // ── Filtered + sorted ───────────────────────────────────────────────────────
  const filtered = useMemo(() => milestones
    .filter(m => {
      const name = (m.title === 'Other' ? m.customTitle : m.title) || '';
      if (!name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus !== 'all' && m.status !== filterStatus) return false;
      if (filterPriority !== 'all' && m.priority !== filterPriority) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate')  return new Date(a.dueDate) - new Date(b.dueDate);
      if (sortBy === 'priority') return { critical:0, high:1, medium:2, low:3 }[a.priority] - { critical:0, high:1, medium:2, low:3 }[b.priority];
      return { overdue:0, 'in-progress':1, pending:2, completed:3 }[a.status] - { overdue:0, 'in-progress':1, pending:2, completed:3 }[b.status];
    }),
  [milestones, search, filterStatus, filterPriority, sortBy]);

  const stats = useMemo(() => ({
    total:       milestones.length,
    completed:   milestones.filter(m => m.status === 'completed').length,
    inProgress:  milestones.filter(m => m.status === 'in-progress').length,
    overdue:     milestones.filter(m => m.status === 'overdue').length,
  }), [milestones]);

  // ────────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:200, color:'#475569' }}>
      <div style={{ width:32, height:32, border:`3px solid rgba(34,211,238,0.2)`,
                    borderTop:`3px solid ${ACCENT}`, borderRadius:'50%',
                    animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ background: DARK, border:`1px solid ${BORDER}`, borderRadius:16,
                  overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,0.4)' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#0f2744 0%,#0d1b2a 100%)',
        borderBottom: `1px solid ${BORDER}`,
        padding: '22px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ color: '#f1f5f9', fontSize: 20, fontWeight: 700 }}>◆ Project Milestones</div>
          <div style={{ color: '#475569', fontSize: 13, marginTop: 4 }}>
            Internal checkpoints & deliverable tracking
          </div>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); setShowCustom(false); setError(''); }}
          style={{
            background: ACCENT, color: '#0d1b2a', border: 'none',
            borderRadius: 10, padding: '10px 20px',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: `0 4px 16px rgba(34,211,238,0.3)`,
            transition: 'all .15s',
          }}
        >
          + Add Milestone
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 8, margin: '0 28px', padding: '10px 16px',
          color: '#fca5a5', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
          marginTop: 16,
        }}>
          ⚠️ {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background:'none', border:'none', color:'#f87171', cursor:'pointer', fontSize:16 }}>×</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ padding: '20px 28px', borderBottom: `1px solid ${BORDER}`,
                    display:'flex', gap:12, flexWrap:'wrap' }}>
        <StatCard label="Total"      value={stats.total}      color="#64748b" icon="📋" />
        <StatCard label="Completed"  value={stats.completed}  color="#10b981" icon="✅" />
        <StatCard label="In Progress"value={stats.inProgress} color="#0ea5e9" icon="🔄" />
        <StatCard label="Overdue"    value={stats.overdue}    color="#ef4444" icon="🚨" />
      </div>

      {/* Visual rail */}
      <MilestoneRail milestones={milestones} />

      {/* Filters */}
      <div style={{ padding: '14px 28px', borderBottom: `1px solid ${BORDER}`,
                    display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
                    background: 'rgba(255,255,255,0.015)' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#475569', fontSize:14 }}>🔍</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search milestones…"
            style={{ ...inputStyle, paddingLeft:34 }}
          />
        </div>
        {/* Status filter */}
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ ...inputStyle, width:'auto', cursor:'pointer' }}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
        {/* Priority filter */}
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          style={{ ...inputStyle, width:'auto', cursor:'pointer' }}>
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        {/* Sort */}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ ...inputStyle, width:'auto', cursor:'pointer' }}>
          <option value="dueDate">Sort: Due Date</option>
          <option value="priority">Sort: Priority</option>
          <option value="status">Sort: Status</option>
        </select>
      </div>

      {/* Milestone list */}
      <div style={{ padding: '20px 28px' }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: 'rgba(255,255,255,0.015)', borderRadius: 12,
            border: '1px dashed rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>◆</div>
            <div style={{ color: '#475569', fontSize: 15, fontWeight: 600 }}>No milestones found</div>
            <button
              onClick={() => { setEditing(null); setShowModal(true); }}
              style={{ marginTop:16, color: ACCENT, background:'none', border:`1px solid ${ACCENT}20`,
                       borderRadius:8, padding:'8px 20px', fontSize:13, fontWeight:600, cursor:'pointer' }}
            >
              Create first milestone
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(m => {
              const s   = STATUS[m.status]   || STATUS.pending;
              const pr  = PRIORITY[m.priority] || PRIORITY.medium;
              const dr  = daysRemaining(m.dueDate);
              const late = m.completionDate ? daysLate(m.dueDate, m.completionDate) : 0;

              return (
                <div key={m._id} style={{
                  background: SURFACE, border: `1px solid ${BORDER}`,
                  borderLeft: `4px solid ${s.color}`,
                  borderRadius: 12, padding: '18px 20px',
                  transition: 'box-shadow .2s, transform .2s',
                  display: 'flex', gap: 16, alignItems: 'flex-start',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 32px ${s.color}20`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  {/* Progress ring */}
                  <div style={{ flexShrink: 0, paddingTop: 2 }}>
                    <ProgressRing pct={m.progress} color={s.color} size={48} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    {/* Title row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                      <span style={{ fontSize: 16 }}>{s.icon}</span>
                      <span style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 700 }}>
                        {m.title === 'Other' ? m.customTitle : m.title}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                        background: pr.bg, color: pr.color, letterSpacing: '.04em',
                      }}>{pr.label}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                        background: s.bg, color: s.color,
                      }}>{s.label}</span>
                    </div>

                    {/* Description */}
                    {m.description && (
                      <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 10px', lineHeight: 1.6 }}>
                        {m.description}
                      </p>
                    )}

                    {/* Meta row */}
                    <div style={{ display:'flex', gap:12, flexWrap:'wrap', fontSize:12 }}>
                      <span style={{ color:'#475569' }}>
                        📅 Due: <span style={{ color:'#94a3b8', fontWeight:600 }}>{fmt(m.dueDate)}</span>
                      </span>
                      {m.completionDate && (
                        <span style={{ color:'#475569' }}>
                          ✅ Completed: <span style={{ color: late > 0 ? '#ef4444' : '#10b981', fontWeight:600 }}>
                            {fmt(m.completionDate)}
                            {late > 0 && ` (+${late}d late)`}
                            {late <= 0 && late !== 0 && ` (${Math.abs(late)}d early)`}
                          </span>
                        </span>
                      )}
                      {m.assignedTo && (
                        <span style={{ color:'#475569' }}>
                          👤 <span style={{ color:'#94a3b8' }}>{m.assignedTo}</span>
                        </span>
                      )}
                      {m.status !== 'completed' && (
                        <span style={{
                          fontWeight: 700,
                          color: dr < 0 ? '#ef4444' : dr <= 7 ? '#f59e0b' : '#22d3ee',
                          background: dr < 0 ? 'rgba(239,68,68,0.1)' : dr <= 7 ? 'rgba(245,158,11,0.1)' : 'rgba(34,211,238,0.08)',
                          padding: '2px 8px', borderRadius: 6,
                        }}>
                          {dr < 0 ? `${Math.abs(dr)}d overdue` : `${dr}d remaining`}
                        </span>
                      )}
                    </div>

                    {/* Progress bar */}
                    {m.progress > 0 && m.status !== 'completed' && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow:'hidden' }}>
                          <div style={{
                            height: '100%', width: `${m.progress}%`,
                            background: `linear-gradient(90deg,${s.color},${s.color}cc)`,
                            borderRadius: 3, transition: 'width .5s',
                          }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display:'flex', flexDirection:'column', gap:6, flexShrink:0 }}>
                    {m.status !== 'completed' && (
                      <button
                        onClick={() => handleComplete(m._id)}
                        title="Mark complete"
                        style={{
                          background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.25)',
                          color:'#10b981', borderRadius:8, padding:'6px 10px',
                          cursor:'pointer', fontSize:16, transition:'all .15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(16,185,129,0.25)'}
                        onMouseLeave={e => e.currentTarget.style.background='rgba(16,185,129,0.12)'}
                      >✓</button>
                    )}
                    <button
                      onClick={() => { setEditing(m); setShowCustom(m.title === 'Other'); setShowModal(true); setError(''); }}
                      title="Edit"
                      style={{
                        background:'rgba(14,165,233,0.12)', border:'1px solid rgba(14,165,233,0.25)',
                        color:'#0ea5e9', borderRadius:8, padding:'6px 10px',
                        cursor:'pointer', fontSize:15, transition:'all .15s',
                      }}
                    >✎</button>
                    <button
                      onClick={() => handleDelete(m._id)}
                      title="Delete"
                      style={{
                        background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)',
                        color:'#ef4444', borderRadius:8, padding:'6px 10px',
                        cursor:'pointer', fontSize:15, transition:'all .15s',
                      }}
                    >🗑</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.75)',
          backdropFilter:'blur(4px)', zIndex:500,
          display:'flex', alignItems:'center', justifyContent:'center', padding:20,
        }}>
          <div style={{
            background:'#162030', borderRadius:16, width:'100%', maxWidth:580,
            border:`1px solid ${BORDER}`, maxHeight:'90vh', overflowY:'auto',
            boxShadow:'0 32px 80px rgba(0,0,0,0.6)',
          }}>
            {/* Modal header */}
            <div style={{
              background:'linear-gradient(135deg,#0f2744,#0d1b2a)',
              borderBottom:`1px solid ${BORDER}`,
              padding:'20px 24px',
              display:'flex', alignItems:'center', justifyContent:'space-between',
            }}>
              <div style={{ color:'#f1f5f9', fontSize:17, fontWeight:700 }}>
                {editing ? '✎ Edit Milestone' : '+ New Milestone'}
              </div>
              <button onClick={() => { setShowModal(false); setEditing(null); setError(''); }}
                style={{ background:'none', border:'none', color:'#64748b', fontSize:22, cursor:'pointer' }}>×</button>
            </div>

            {error && (
              <div style={{ margin:'16px 24px 0', background:'rgba(239,68,68,0.12)',
                            border:'1px solid rgba(239,68,68,0.25)', borderRadius:8,
                            padding:'10px 14px', color:'#fca5a5', fontSize:13 }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ padding:24, display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {/* Type */}
                <div>
                  <label style={labelStyle}>Milestone Type *</label>
                  <select
                    name="title" required
                    defaultValue={editing?.title || 'First Quarter Report'}
                    onChange={e => setShowCustom(e.target.value === 'Other')}
                    style={{ ...inputStyle, cursor:'pointer' }}
                  >
                    {MILESTONE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {/* Priority */}
                <div>
                  <label style={labelStyle}>Priority</label>
                  <select name="priority" defaultValue={editing?.priority || 'medium'}
                    style={{ ...inputStyle, cursor:'pointer' }}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Custom title */}
              {showCustom && (
                <div>
                  <label style={labelStyle}>Custom Title *</label>
                  <input type="text" name="customTitle"
                    defaultValue={editing?.customTitle || ''}
                    placeholder="Enter custom milestone name"
                    style={inputStyle} required={showCustom} />
                </div>
              )}

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea name="description" rows={3}
                  defaultValue={editing?.description || ''}
                  placeholder="What needs to be accomplished?"
                  style={{ ...inputStyle, resize:'vertical' }} />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {/* Due date */}
                <div>
                  <label style={labelStyle}>Due Date *</label>
                  <input type="date" name="dueDate" required
                    defaultValue={editing?.dueDate ? new Date(editing.dueDate).toISOString().split('T')[0] : ''}
                    style={{ ...inputStyle, colorScheme:'dark' }} />
                </div>
                {/* Progress (edit only) */}
                {editing && (
                  <div>
                    <label style={labelStyle}>Progress (%)</label>
                    <input type="number" name="progress" min={0} max={100}
                      defaultValue={editing?.progress || 0}
                      style={inputStyle} />
                  </div>
                )}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div>
                  <label style={labelStyle}>Assigned To</label>
                  <input type="text" name="assignedTo"
                    defaultValue={editing?.assignedTo || ''}
                    placeholder="Person or team"
                    style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Resources Needed</label>
                  <input type="text" name="resourcesNeeded"
                    defaultValue={editing?.resourcesNeeded || ''}
                    placeholder="Equipment, budget, etc."
                    style={inputStyle} />
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display:'flex', gap:12, paddingTop:8 }}>
                <button type="submit" disabled={saving} style={{
                  flex:1, background: ACCENT, color:'#0d1b2a',
                  border:'none', borderRadius:10, padding:'12px 0',
                  fontSize:14, fontWeight:700, cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1, transition:'all .15s',
                }}>
                  {saving ? 'Saving…' : editing ? 'Update Milestone' : 'Create Milestone'}
                </button>
                <button type="button"
                  onClick={() => { setShowModal(false); setEditing(null); setError(''); }}
                  style={{
                    flex:1, background:'rgba(255,255,255,0.05)',
                    border:`1px solid ${BORDER}`, borderRadius:10, padding:'12px 0',
                    fontSize:14, fontWeight:600, color:'#94a3b8', cursor:'pointer',
                  }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneManager;