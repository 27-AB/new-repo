import React, { useState, useEffect, useMemo, useRef } from 'react';

// ─── Date utilities ───────────────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const fmt = (date, format) => {
  const d = new Date(date);
  if (format === 'MMM dd') return `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2,'0')}`;
  if (format === 'MMM dd, yyyy') return `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2,'0')}, ${d.getFullYear()}`;
  if (format === 'dd') return String(d.getDate()).padStart(2,'0');
  if (format === 'MMM') return MONTHS[d.getMonth()];
  if (format === 'MMM yyyy') return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  return d.toLocaleDateString();
};

const diffDays = (a, b) => Math.ceil((new Date(b) - new Date(a)) / 86400000);
const addDays  = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

const daysInInterval = (start, end) => {
  const days = [], cur = new Date(start), fin = new Date(end);
  while (cur <= fin) { days.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }
  return days;
};

// ─── Colours ─────────────────────────────────────────────────────────────────
const STATUS_COLOR = {
  not_started: { bar: 'linear-gradient(90deg,#475569,#64748b)', text: '#94a3b8', label: 'Not Started' },
  in_progress:  { bar: 'linear-gradient(90deg,#0ea5e9,#38bdf8)', text: '#38bdf8', label: 'In Progress'  },
  completed:    { bar: 'linear-gradient(90deg,#10b981,#34d399)', text: '#34d399', label: 'Completed'    },
  delayed:      { bar: 'linear-gradient(90deg,#ef4444,#f87171)', text: '#f87171', label: 'Delayed'      },
  on_hold:      { bar: 'linear-gradient(90deg,#f59e0b,#fbbf24)', text: '#fbbf24', label: 'On Hold'      },
  cancelled:    { bar: 'linear-gradient(90deg,#8b5cf6,#a78bfa)', text: '#a78bfa', label: 'Cancelled'    },
};

const MILESTONE_COLOR = {
  completed: '#10b981',
  overdue:   '#ef4444',
  'in-progress': '#0ea5e9',
  pending:   '#f59e0b',
};

const CRUNCH_COLOR = (n) =>
  n >= 5 ? { bg: 'rgba(220,38,38,0.18)', border: '#ef4444' } :
  n >= 4 ? { bg: 'rgba(239,68,68,0.14)', border: '#f87171' } :
  n >= 3 ? { bg: 'rgba(245,158,11,0.14)', border: '#fbbf24' } :
           { bg: 'rgba(14,165,233,0.10)', border: '#38bdf8' };

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  root: {
    background: '#0d1b2a',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  header: {
    background: 'linear-gradient(135deg,#0f2744 0%,#0d1b2a 100%)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    padding: '22px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  title: { color: '#f1f5f9', fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: '-0.3px' },
  sub:   { color: '#64748b', fontSize: 13, marginTop: 4 },
  controls: {
    background: 'rgba(255,255,255,0.03)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '14px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  toggleBtn: (on) => ({
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 14px', borderRadius: 8,
    border: `1px solid ${on ? '#22d3ee' : 'rgba(255,255,255,0.1)'}`,
    background: on ? 'rgba(34,211,238,0.12)' : 'rgba(255,255,255,0.04)',
    color: on ? '#22d3ee' : '#64748b',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    transition: 'all .2s',
  }),
  viewBtn: (on) => ({
    padding: '6px 14px', borderRadius: 6,
    border: 'none',
    background: on ? '#22d3ee' : 'transparent',
    color: on ? '#0d1b2a' : '#64748b',
    fontSize: 12, fontWeight: 700, cursor: 'pointer',
    transition: 'all .15s',
  }),
  crunchBanner: {
    background: 'linear-gradient(90deg,rgba(220,38,38,0.08),rgba(245,158,11,0.06))',
    borderBottom: '1px solid rgba(220,38,38,0.2)',
    padding: '14px 28px',
  },
  crunchCard: {
    background: '#162030',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 10,
    padding: '10px 14px',
    minWidth: 160,
    flex: '1 1 160px',
  },
  scrollWrap: { overflowX: 'auto', position: 'relative' },
  inner: { minWidth: 1100 },
  colLabel: {
    color: '#475569', fontSize: 10, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '.08em',
    padding: '10px 16px',
    background: '#0d1b2a',
    borderRight: '1px solid rgba(255,255,255,0.07)',
    whiteSpace: 'nowrap',
  },
  dayCell: (isWeekend, isToday) => ({
    flex: '0 0 32px', width: 32, textAlign: 'center',
    padding: '6px 0',
    background: isToday ? 'rgba(34,211,238,0.08)' : isWeekend ? 'rgba(255,255,255,0.02)' : 'transparent',
    borderRight: '1px solid rgba(255,255,255,0.03)',
    borderLeft: isToday ? '1px solid rgba(34,211,238,0.4)' : 'none',
    position: 'relative',
  }),
  projectLabel: {
    flex: '0 0 260px', width: 260,
    padding: '14px 16px',
    background: '#0d1b2a',
    borderRight: '1px solid rgba(255,255,255,0.07)',
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
  },
  projectTitle: {
    color: '#e2e8f0', fontSize: 13, fontWeight: 600,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    marginBottom: 4,
  },
  legend: {
    background: 'rgba(255,255,255,0.02)',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    padding: '14px 28px',
    display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center',
  },
  legendItem: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '80px 40px',
    background: '#0d1b2a',
    borderRadius: 16,
    border: '1px dashed rgba(255,255,255,0.08)',
    color: '#475569',
    gap: 12,
  },
};

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function Tooltip({ children, text }) {
  const [show, setShow] = useState(false);
  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div style={{
          position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)',
          background: '#162030', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 8, padding: '8px 12px', zIndex: 100,
          whiteSpace: 'nowrap', color: '#e2e8f0', fontSize: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
        }}>
          {text}
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
            borderTop: '6px solid rgba(255,255,255,0.12)',
          }} />
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const GanttChart = ({ projects = [], timelines = [], milestones = [], entityType = 'research', onEdit, onDelete, canEdit, canDelete }) => {
  const [viewMode,      setViewMode]      = useState('month');
  const [showMilestones,setShowMilestones] = useState(true);
  const [showActual,    setShowActual]    = useState(true);
  const [showOverlaps,  setShowOverlaps]  = useState(true);
  const [selectedId,    setSelectedId]    = useState(null);
  const [hoveredId,     setHoveredId]     = useState(null);
  const today = useMemo(() => new Date(), []);

  // ── Build view range ──────────────────────────────────────────────────────
  const viewRange = useMemo(() => {
    if (!projects.length) return { start: today, end: addDays(today, 60) };
    const allDates = projects.flatMap(p => [
      new Date(p.startDate || p.plannedStart || today),
      new Date(p.endDate   || p.plannedEnd   || addDays(today, 60)),
    ]);
    const buffer = viewMode === 'year' ? 90 : viewMode === 'quarter' ? 45 : 20;
    return {
      start: addDays(new Date(Math.min(...allDates)), -buffer),
      end:   addDays(new Date(Math.max(...allDates)),  buffer),
    };
  }, [projects, viewMode, today]);

  const days = useMemo(() => daysInInterval(viewRange.start, viewRange.end), [viewRange]);

  // Group days by month for the month header row
  const monthGroups = useMemo(() => {
    const groups = [];
    days.forEach((day, i) => {
      const key = `${day.getFullYear()}-${day.getMonth()}`;
      if (!groups.length || groups[groups.length - 1].key !== key) {
        groups.push({ key, label: fmt(day, 'MMM yyyy'), start: i, count: 1 });
      } else {
        groups[groups.length - 1].count++;
      }
    });
    return groups;
  }, [days]);

  // ── Per-project enriched data ─────────────────────────────────────────────
  const rows = useMemo(() => projects.map(p => {
    const tl  = timelines?.find(t => String(t.entityId) === String(p._id)) || {};
    const mls = milestones?.filter(m => String(m.projectId) === String(p._id)) || [];
    const plannedStart = new Date(p.startDate || p.plannedStart || today);
    const plannedEnd   = new Date(p.endDate   || p.plannedEnd   || addDays(today, 90));
    const actualStart  = tl.actualStart ? new Date(tl.actualStart) : null;
    const actualEnd    = tl.actualEnd   ? new Date(tl.actualEnd)   : null;
    const status       = tl.status || 'not_started';
    const pct          = tl.completionPercentage || 0;
    const daysDelayed  = (tl.daysDelayed || 0);

    return { ...p, tl, mls, plannedStart, plannedEnd, actualStart, actualEnd, status, pct, daysDelayed };
  }), [projects, timelines, milestones, today]);

  // ── Crunch periods ────────────────────────────────────────────────────────
  const crunchMap = useMemo(() => {
    if (!showOverlaps) return {};
    const map = {}; // date-string → count
    rows.forEach(r => {
      const s = new Date(Math.max(r.plannedStart, viewRange.start));
      const e = new Date(Math.min(r.plannedEnd,   viewRange.end));
      const cur = new Date(s);
      while (cur <= e) {
        const key = cur.toISOString().slice(0,10);
        map[key] = (map[key] || 0) + 1;
        cur.setDate(cur.getDate() + 1);
      }
    });
    return map;
  }, [rows, showOverlaps, viewRange]);

  const topCrunchPeriods = useMemo(() => {
    // Merge consecutive crunch days into periods
    const periods = [];
    let cur = null;
    days.forEach(day => {
      const key = day.toISOString().slice(0,10);
      const cnt = crunchMap[key] || 0;
      if (cnt >= 2) {
        if (cur && cur.count === cnt) {
          cur.end = day;
        } else {
          if (cur) periods.push(cur);
          cur = { start: day, end: day, count: cnt };
        }
      } else {
        if (cur) { periods.push(cur); cur = null; }
      }
    });
    if (cur) periods.push(cur);
    return periods.sort((a,b) => b.count - a.count).slice(0, 5);
  }, [days, crunchMap]);

  // ── Bar position helper ───────────────────────────────────────────────────
  const barStyle = (start, end) => {
    const total = days.length;
    if (!total) return { display: 'none' };
    const startDiff = diffDays(viewRange.start, start);
    const dur       = Math.max(1, diffDays(start, end));
    const left = (startDiff / total) * 100;
    const width = (dur / total) * 100;
    return { left: `${Math.max(0, left)}%`, width: `${Math.min(100, width)}%`, position: 'absolute' };
  };

  const todayStyle = () => {
    const offset = diffDays(viewRange.start, today);
    const pct    = (offset / days.length) * 100;
    return { left: `${pct}%` };
  };

  // ─────────────────────────────────────────────────────────────────────────
  if (!projects.length) {
    return (
      <div style={S.empty}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#334155' }}>No projects to display</div>
        <div style={{ fontSize: 13 }}>Add research projects to visualize the timeline</div>
      </div>
    );
  }

  const totalMilestones = rows.reduce((s, r) => s + r.mls.length, 0);

  return (
    <div style={S.root}>

      {/* ── Header ── */}
      <div style={S.header}>
        <div>
          <div style={S.title}>📊 Project Timeline — Gantt View</div>
          <div style={S.sub}>
            {projects.length} projects · {totalMilestones} milestones · Planned vs Actual tracking
          </div>
        </div>
        {/* View mode toggle */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 3, gap: 2 }}>
          {['month','quarter','year'].map(m => (
            <button key={m} style={S.viewBtn(viewMode === m)} onClick={() => setViewMode(m)}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Control toggles ── */}
      <div style={S.controls}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button style={S.toggleBtn(showMilestones)} onClick={() => setShowMilestones(v => !v)}>
            <span style={{ fontSize: 14 }}>◆</span> Milestones
          </button>
          <button style={S.toggleBtn(showActual)} onClick={() => setShowActual(v => !v)}>
            <span style={{ width: 12, height: 6, background: '#f59e0b', borderRadius: 2, display: 'inline-block' }} />
            Actual Timeline
          </button>
          <button style={S.toggleBtn(showOverlaps)} onClick={() => setShowOverlaps(v => !v)}>
            <span style={{ fontSize: 14 }}>🔥</span> Crunch Periods
          </button>
        </div>
        <div style={{ fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 2, height: 16, background: '#22d3ee', borderRadius: 1, display: 'inline-block' }} />
          Today: {fmt(today, 'MMM dd, yyyy')}
        </div>
      </div>

      {/* ── Crunch alert ── */}
      {showOverlaps && topCrunchPeriods.length > 0 && (
        <div style={S.crunchBanner}>
          <div style={{ color: '#fca5a5', fontSize: 12, fontWeight: 700, marginBottom: 10,
                        display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>⚠️</span> Resource Crunch Periods Detected
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {topCrunchPeriods.map((p, i) => {
              const c = CRUNCH_COLOR(p.count);
              return (
                <div key={i} style={{ ...S.crunchCard, borderColor: c.border, background: c.bg }}>
                  <div style={{ color: c.border, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                    {p.count} projects overlapping
                  </div>
                  <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>
                    {fmt(p.start, 'MMM dd')} – {fmt(p.end, 'MMM dd')}
                  </div>
                  <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
                    {diffDays(p.start, p.end) + 1} days high load
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Gantt table ── */}
      <div style={S.scrollWrap}>
        <div style={S.inner}>

          {/* Month header row */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0a1628' }}>
            <div style={{ ...S.colLabel, flex: '0 0 260px', width: 260 }}>Project</div>
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {monthGroups.map((g, i) => (
                <div key={i} style={{
                  flex: `0 0 ${g.count * 32}px`, width: g.count * 32,
                  padding: '8px 10px',
                  borderRight: '1px solid rgba(255,255,255,0.06)',
                  color: '#64748b', fontSize: 11, fontWeight: 700,
                  letterSpacing: '.06em', textTransform: 'uppercase',
                  background: '#0a1628',
                }}>
                  {g.label}
                </div>
              ))}
            </div>
          </div>

          {/* Day header row */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0d1b2a', position: 'sticky', top: 0, zIndex: 10 }}>
            <div style={{ ...S.colLabel, flex: '0 0 260px', width: 260 }}></div>
            <div style={{ flex: 1, display: 'flex' }}>
              {days.map((day, i) => {
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const isToday   = day.toISOString().slice(0,10) === today.toISOString().slice(0,10);
                const dateKey   = day.toISOString().slice(0,10);
                const crunch    = crunchMap[dateKey] || 0;
                return (
                  <div key={i} style={{
                    ...S.dayCell(isWeekend, isToday),
                    background: isToday
                      ? 'rgba(34,211,238,0.12)'
                      : (showOverlaps && crunch >= 2)
                        ? CRUNCH_COLOR(crunch).bg
                        : isWeekend
                          ? 'rgba(255,255,255,0.015)'
                          : 'transparent',
                  }}>
                    <div style={{ color: isToday ? '#22d3ee' : '#334155', fontSize: 10, fontWeight: isToday ? 700 : 500 }}>
                      {fmt(day, 'dd')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Project rows */}
          {rows.map((row, rIdx) => {
            const sc        = STATUS_COLOR[row.status] || STATUS_COLOR.not_started;
            const isSelected = selectedId === row._id;
            const isHovered  = hoveredId  === row._id;
            const rowHeight  = showMilestones && row.mls.length ? 80 : 56;

            return (
              <div
                key={row._id}
                style={{
                  display: 'flex',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: isSelected
                    ? 'rgba(34,211,238,0.06)'
                    : isHovered
                      ? 'rgba(255,255,255,0.02)'
                      : 'transparent',
                  cursor: 'pointer',
                  transition: 'background .15s',
                  minHeight: rowHeight,
                }}
                onClick={() => setSelectedId(v => v === row._id ? null : row._id)}
                onMouseEnter={() => setHoveredId(row._id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Project label column */}
                <div style={{ ...S.projectLabel, minHeight: rowHeight }}>
                  <div style={S.projectTitle} title={row.title}>{row.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                      background: `${sc.text}18`, color: sc.text, letterSpacing: '.04em',
                    }}>{sc.label}</span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{row.pct}%</span>
                    {row.daysDelayed > 0 && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                        background: 'rgba(239,68,68,0.15)', color: '#f87171',
                      }}>+{row.daysDelayed}d late</span>
                    )}
                  </div>
                </div>

                {/* Timeline track */}
                <div style={{ flex: 1, position: 'relative', minHeight: rowHeight }}>

                  {/* Crunch column tints behind bars */}
                  {showOverlaps && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', pointerEvents: 'none' }}>
                      {days.map((day, i) => {
                        const cnt = crunchMap[day.toISOString().slice(0,10)] || 0;
                        return (
                          <div key={i} style={{
                            flex: '0 0 32px', width: 32,
                            background: (cnt >= 2) ? CRUNCH_COLOR(cnt).bg : 'transparent',
                          }} />
                        );
                      })}
                    </div>
                  )}

                  {/* Today vertical marker */}
                  <div style={{
                    position: 'absolute', top: 0, bottom: 0,
                    width: 2, background: 'rgba(34,211,238,0.5)',
                    ...todayStyle(),
                    zIndex: 5, pointerEvents: 'none',
                  }} />

                  {/* Planned bar */}
                  <Tooltip text={`Planned: ${fmt(row.plannedStart,'MMM dd')} → ${fmt(row.plannedEnd,'MMM dd')}  (${diffDays(row.plannedStart, row.plannedEnd)} days)`}>
                    <div style={{
                      ...barStyle(row.plannedStart, row.plannedEnd),
                      top: showActual && row.actualStart ? 10 : 18,
                      height: 18, borderRadius: 6,
                      background: sc.bar,
                      boxShadow: `0 2px 8px ${sc.text}30`,
                      overflow: 'hidden',
                    }}>
                      {/* Progress fill */}
                      <div style={{
                        position: 'absolute', top: 0, left: 0, bottom: 0,
                        width: `${row.pct}%`,
                        background: 'rgba(255,255,255,0.25)',
                        transition: 'width .4s',
                      }} />
                      {row.pct > 20 && (
                        <div style={{
                          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700,
                          textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                        }}>{row.pct}%</div>
                      )}
                    </div>
                  </Tooltip>

                  {/* Actual bar (below planned) */}
                  {showActual && row.actualStart && (
                    <Tooltip text={`Actual: ${fmt(row.actualStart,'MMM dd')} → ${row.actualEnd ? fmt(row.actualEnd,'MMM dd') : 'In progress'}${row.daysDelayed > 0 ? `  ⚠ +${row.daysDelayed}d delay` : ''}`}>
                      <div style={{
                        ...barStyle(row.actualStart, row.actualEnd || today),
                        top: 34, height: 12, borderRadius: 4,
                        background: row.daysDelayed > 0
                          ? 'linear-gradient(90deg,#dc2626,#ef4444)'
                          : 'linear-gradient(90deg,#16a34a,#22c55e)',
                        opacity: 0.85,
                        boxShadow: row.daysDelayed > 0 ? '0 2px 8px rgba(239,68,68,0.3)' : 'none',
                      }} />
                    </Tooltip>
                  )}

                  {/* Milestone diamonds */}
                  {showMilestones && row.mls.map((m, mi) => {
                    const mDate = new Date(m.dueDate);
                    const mOff  = diffDays(viewRange.start, mDate);
                    const mPct  = (mOff / days.length) * 100;
                    if (mPct < 0 || mPct > 100) return null;
                    const mc = MILESTONE_COLOR[m.status] || MILESTONE_COLOR.pending;
                    return (
                      <Tooltip key={mi} text={`${m.title === 'Other' ? m.customTitle : m.title}  •  Due: ${fmt(m.dueDate,'MMM dd, yyyy')}  •  ${m.status}`}>
                        <div style={{
                          position: 'absolute',
                          left: `calc(${mPct}% - 8px)`,
                          top: (showActual && row.actualStart) ? 52 : 40,
                          width: 16, height: 16,
                          transform: 'rotate(45deg)',
                          background: mc,
                          border: '2px solid #0d1b2a',
                          boxShadow: `0 0 8px ${mc}60`,
                          zIndex: 6, cursor: 'pointer',
                          transition: 'transform .15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'rotate(45deg) scale(1.4)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'rotate(45deg) scale(1)'}
                        />
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Selected project detail ── */}
      {selectedId && (() => {
        const row = rows.find(r => r._id === selectedId);
        if (!row) return null;
        const sc = STATUS_COLOR[row.status] || STATUS_COLOR.not_started;
        const completedMls = row.mls.filter(m => m.status === 'completed').length;
        const overdueMls   = row.mls.filter(m => m.status === 'overdue').length;
        return (
          <div style={{
            background: 'rgba(34,211,238,0.04)',
            borderTop: '1px solid rgba(34,211,238,0.15)',
            padding: '20px 28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ color: '#22d3ee', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                ◈ {row.title}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setSelectedId(null)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 12px',
                    color: '#94a3b8',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'Duration',    value: `${diffDays(row.plannedStart, row.plannedEnd)} days` },
                { label: 'Progress',    value: `${row.pct}%`, accent: '#22d3ee' },
                { label: 'Milestones',  value: `${completedMls}/${row.mls.length} done` },
                { label: 'Overdue',     value: overdueMls, accent: overdueMls ? '#f87171' : null },
                { label: 'Delay',       value: row.daysDelayed > 0 ? `+${row.daysDelayed} days` : 'On time', accent: row.daysDelayed > 0 ? '#f87171' : '#34d399' },
                { label: 'Planned End', value: fmt(row.plannedEnd, 'MMM dd, yyyy') },
                { label: 'Actual End',  value: row.actualEnd ? fmt(row.actualEnd, 'MMM dd, yyyy') : '—' },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: '#162030',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 10, padding: '12px 16px',
                  flex: '1 1 120px', minWidth: 120,
                }}>
                  <div style={{ color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
                    {stat.label}
                  </div>
                  <div style={{ color: stat.accent || '#e2e8f0', fontSize: 18, fontWeight: 700 }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            {((onEdit || onDelete) && (canEdit(row) || canDelete(row))) && (
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                {canEdit(row) && onEdit && (
                  <button
                    onClick={() => { onEdit(row); setSelectedId(null); }}
                    style={{
                      background: '#22d3ee',
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 16px',
                      color: '#0d1b2a',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ✎ Edit
                  </button>
                )}
                {canDelete(row) && onDelete && (
                  <button
                    onClick={() => { if (window.confirm('Are you sure you want to delete this project?')) onDelete(row._id); setSelectedId(null); }}
                    style={{
                      background: '#ef4444',
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 16px',
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    🗑 Delete
                  </button>
                )}
              </div>
            )}

            {/* Milestone list for selected project */}
            {row.mls.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700,
                              textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
                  Milestones
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {row.mls.map((m, mi) => {
                    const mc = MILESTONE_COLOR[m.status] || MILESTONE_COLOR.pending;
                    return (
                      <div key={mi} style={{
                        background: '#0d1b2a',
                        border: `1px solid ${mc}40`,
                        borderRadius: 8, padding: '8px 12px',
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}>
                        <span style={{ color: mc, fontSize: 14 }}>◆</span>
                        <div>
                          <div style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 600 }}>
                            {m.title === 'Other' ? m.customTitle : m.title}
                          </div>
                          <div style={{ color: '#475569', fontSize: 11 }}>
                            Due: {fmt(m.dueDate, 'MMM dd, yyyy')}
                            {m.completionDate && (
                              <span style={{ color: mc, marginLeft: 6 }}>
                                · Done: {fmt(m.completionDate, 'MMM dd, yyyy')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Legend ── */}
      <div style={S.legend}>
        <div style={{ color: '#334155', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '.08em', marginRight: 4 }}>Legend</div>
        {Object.entries(STATUS_COLOR).map(([k, v]) => (
          <div key={k} style={S.legendItem}>
            <div style={{ width: 24, height: 8, borderRadius: 3, background: v.bar }} />
            <span>{v.label}</span>
          </div>
        ))}
        <div style={S.legendItem}>
          <div style={{ width: 24, height: 8, borderRadius: 3,
                        background: 'linear-gradient(90deg,#16a34a,#22c55e)' }} />
          <span>Actual (on time)</span>
        </div>
        <div style={S.legendItem}>
          <div style={{ width: 24, height: 8, borderRadius: 3,
                        background: 'linear-gradient(90deg,#dc2626,#ef4444)' }} />
          <span>Actual (delayed)</span>
        </div>
        <div style={S.legendItem}>
          <span style={{ color: '#f59e0b', fontSize: 16 }}>◆</span>
          <span>Milestone</span>
        </div>
        <div style={S.legendItem}>
          <div style={{ width: 2, height: 14, background: 'rgba(34,211,238,0.6)', borderRadius: 1 }} />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;