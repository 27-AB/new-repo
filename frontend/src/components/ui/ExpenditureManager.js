import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getServiceUrl } from '../../config/api';

const DARK = '#0d1b2a';
const SURFACE = '#162030';
const BORDER = 'rgba(255,255,255,0.07)';
const ACCENT = '#22d3ee';

const CATEGORIES = [
  'Equipment', 'Personnel', 'Materials', 'Travel', 
  'Software', 'Services', 'Overhead', 'Publication', 
  'Training', 'Other'
];

const STATUS_COLORS = {
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Pending', icon: '⏳' },
  approved: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Approved', icon: '✅' },
  rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'Rejected', icon: '❌' },
};

const fmt = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const fmtETB = (n) => {
  if (!n && n !== 0) return '—';
  return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', minimumFractionDigits: 0 }).format(n);
};

export default function ExpenditureManager({ projectId, projectTitle, budget, onClose, serviceType = 'research' }) {
  const { token } = useAuth();
  const [expenditures, setExpenditures] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const EMPTY_FORM = {
    description: '',
    amount: '',
    category: 'Other',
    date: new Date().toISOString().split('T')[0],
    receiptNumber: '',
    vendor: '',
    notes: '',
    submittedByName: 'Researcher'
  };

  const [form, setForm] = useState(EMPTY_FORM);

  const API = getServiceUrl(serviceType);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/expenditures/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setExpenditures(data.expenditures || []);
        setSummary(data.summary || null);
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) load();
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const url = editing
        ? `${API}/expenditures/${editing._id}`
        : `${API}/expenditures`;
      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...form, projectId })
      });

      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setEditing(null);
        setForm(EMPTY_FORM);
        load();
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expenditure?')) return;
    try {
      const res = await fetch(`${API}/expenditures/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        load();
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${API}/expenditures/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        load();
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejection:');
    if (!reason) return;
    try {
      const res = await fetch(`${API}/expenditures/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (data.success) {
        load();
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const progressColor = (pct) => {
    if (pct >= 100) return '#ef4444';
    if (pct >= 90) return '#f59e0b';
    if (pct >= 75) return '#eab308';
    return '#10b981';
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: 20
    }}>
      <div style={{
        background: DARK, border: `1px solid ${BORDER}`, borderRadius: 16,
        maxWidth: 1200, width: '100%', maxHeight: '90vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg,#0f2744 0%,#0d1b2a 100%)',
          borderBottom: `1px solid ${BORDER}`, padding: '22px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ color: '#f1f5f9', fontSize: 20, fontWeight: 700, margin: 0 }}>
              💰 Budget & Expenditure Tracking
            </h2>
            <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0 0' }}>
              {projectTitle}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.05)', border: 'none',
            color: '#94a3b8', fontSize: 24, cursor: 'pointer',
            width: 32, height: 32, borderRadius: 8, lineHeight: '32px'
          }}>×</button>
        </div>

        {/* Budget Summary */}
        {summary && (
          <div style={{
            background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${BORDER}`,
            padding: '20px 28px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
              <div style={{
                background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10,
                padding: '14px 18px', textAlign: 'center'
              }}>
                <div style={{ color: '#10b981', fontSize: 22, fontWeight: 700 }}>{fmtETB(summary.budget)}</div>
                <div style={{ color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 4 }}>Total Budget</div>
              </div>
              
              <div style={{
                background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10,
                padding: '14px 18px', textAlign: 'center'
              }}>
                <div style={{ color: summary.isOverBudget ? '#ef4444' : '#0ea5e9', fontSize: 22, fontWeight: 700 }}>{fmtETB(summary.totalSpent)}</div>
                <div style={{ color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 4 }}>Total Spent</div>
              </div>
              
              <div style={{
                background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10,
                padding: '14px 18px', textAlign: 'center'
              }}>
                <div style={{ color: '#f59e0b', fontSize: 22, fontWeight: 700 }}>{fmtETB(summary.totalPending)}</div>
                <div style={{ color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 4 }}>Pending</div>
              </div>
              
              <div style={{
                background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10,
                padding: '14px 18px', textAlign: 'center'
              }}>
                <div style={{ color: summary.remaining >= 0 ? '#10b981' : '#ef4444', fontSize: 22, fontWeight: 700 }}>{fmtETB(summary.remaining)}</div>
                <div style={{ color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 4 }}>Remaining</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>Budget Usage</span>
                <span style={{ color: progressColor(summary.percentUsed), fontSize: 13, fontWeight: 700 }}>
                  {summary.percentUsed.toFixed(1)}%
                </span>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.05)', borderRadius: 8, height: 12, overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min(summary.percentUsed, 100)}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${progressColor(summary.percentUsed)}, ${progressColor(summary.percentUsed)}dd)`,
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>

            {/* Warnings */}
            {summary.isOverBudget && (
              <div style={{
                marginTop: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 8, padding: '10px 16px', color: '#fca5a5', fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                🚨 <strong>Over Budget!</strong> Expenditure exceeds allocated budget by {fmtETB(Math.abs(summary.remaining))}
              </div>
            )}
            
            {summary.willExceedBudget && !summary.isOverBudget && (
              <div style={{
                marginTop: 12, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: 8, padding: '10px 16px', color: '#fbbf24', fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                ⚠️ <strong>Warning:</strong> Including pending expenses, projected total is {fmtETB(summary.projectedTotal)}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 8, padding: '10px 16px', marginBottom: 16,
              color: '#fca5a5', fontSize: 13
            }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 600, margin: 0 }}>
              Expenditure Log ({expenditures.length})
            </h3>
            <button onClick={() => { setShowForm(true); setEditing(null); setForm(EMPTY_FORM); }} style={{
              background: ACCENT, border: 'none', color: DARK, padding: '8px 16px',
              borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer'
            }}>
              + Log Expense
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <form onSubmit={handleSubmit} style={{
              background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12,
              padding: 20, marginBottom: 20
            }}>
              <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
                {editing ? 'Edit Expenditure' : 'New Expenditure'}
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, fontWeight: 600, marginBottom: 5 }}>
                    DESCRIPTION *
                  </label>
                  <input required value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    style={{
                      width: '100%', background: '#0f1824', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8, padding: '9px 12px', color: '#e2e8f0', fontSize: 13
                    }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, fontWeight: 600, marginBottom: 5 }}>
                    AMOUNT (ETB) *
                  </label>
                  <input type="number" required min="0" step="0.01" value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    style={{
                      width: '100%', background: '#0f1824', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8, padding: '9px 12px', color: '#e2e8f0', fontSize: 13
                    }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, fontWeight: 600, marginBottom: 5 }}>
                    CATEGORY *
                  </label>
                  <select required value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    style={{
                      width: '100%', background: '#0f1824', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8, padding: '9px 12px', color: '#e2e8f0', fontSize: 13
                    }}>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, fontWeight: 600, marginBottom: 5 }}>
                    DATE *
                  </label>
                  <input type="date" required value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    style={{
                      width: '100%', background: '#0f1824', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8, padding: '9px 12px', color: '#e2e8f0', fontSize: 13
                    }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, fontWeight: 600, marginBottom: 5 }}>
                    RECEIPT/INVOICE #
                  </label>
                  <input value={form.receiptNumber}
                    onChange={e => setForm({ ...form, receiptNumber: e.target.value })}
                    style={{
                      width: '100%', background: '#0f1824', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8, padding: '9px 12px', color: '#e2e8f0', fontSize: 13
                    }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, fontWeight: 600, marginBottom: 5 }}>
                    VENDOR
                  </label>
                  <input value={form.vendor}
                    onChange={e => setForm({ ...form, vendor: e.target.value })}
                    style={{
                      width: '100%', background: '#0f1824', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8, padding: '9px 12px', color: '#e2e8f0', fontSize: 13
                    }} />
                </div>
                
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, fontWeight: 600, marginBottom: 5 }}>
                    NOTES
                  </label>
                  <textarea value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    style={{
                      width: '100%', background: '#0f1824', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8, padding: '9px 12px', color: '#e2e8f0', fontSize: 13,
                      fontFamily: 'inherit', resize: 'vertical'
                    }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="submit" style={{
                  background: ACCENT, border: 'none', color: DARK, padding: '8px 16px',
                  borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer'
                }}>
                  {editing ? 'Update' : 'Create'} Expenditure
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM); }} style={{
                  background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8',
                  padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer'
                }}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Expenditure List */}
          {loading ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>Loading...</div>
          ) : expenditures.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>
              No expenditures logged yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {expenditures.map(exp => {
                const s = STATUS_COLORS[exp.status] || STATUS_COLORS.pending;
                return (
                  <div key={exp._id} style={{
                    background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12,
                    padding: '16px 20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <span style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 600 }}>
                            {exp.description}
                          </span>
                          <span style={{
                            background: s.bg, color: s.color, padding: '2px 8px',
                            borderRadius: 6, fontSize: 11, fontWeight: 700
                          }}>
                            {s.icon} {s.label}
                          </span>
                          <span style={{
                            background: 'rgba(14,165,233,0.12)', color: '#38bdf8',
                            padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700
                          }}>
                            {exp.category}
                          </span>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, color: '#94a3b8', fontSize: 12 }}>
                          <div><strong>Amount:</strong> {fmtETB(exp.amount)}</div>
                          <div><strong>Date:</strong> {fmt(exp.date)}</div>
                          {exp.vendor && <div><strong>Vendor:</strong> {exp.vendor}</div>}
                          {exp.receiptNumber && <div><strong>Receipt:</strong> {exp.receiptNumber}</div>}
                          <div><strong>By:</strong> {exp.submittedByName}</div>
                        </div>
                        
                        {exp.notes && (
                          <div style={{ marginTop: 8, color: '#64748b', fontSize: 12, fontStyle: 'italic' }}>
                            {exp.notes}
                          </div>
                        )}
                        
                        {exp.rejectionReason && (
                          <div style={{
                            marginTop: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 6, padding: '6px 10px', color: '#fca5a5', fontSize: 12
                          }}>
                            <strong>Rejection Reason:</strong> {exp.rejectionReason}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', gap: 6, marginLeft: 16 }}>
                        {exp.status === 'pending' && (
                          <>
                            <button onClick={() => handleApprove(exp._id)} style={{
                              background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                              color: '#10b981', padding: '4px 10px', borderRadius: 6,
                              fontSize: 11, fontWeight: 600, cursor: 'pointer'
                            }}>
                              ✓ Approve
                            </button>
                            <button onClick={() => handleReject(exp._id)} style={{
                              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                              color: '#ef4444', padding: '4px 10px', borderRadius: 6,
                              fontSize: 11, fontWeight: 600, cursor: 'pointer'
                            }}>
                              ✗ Reject
                            </button>
                          </>
                        )}
                        <button onClick={() => { setEditing(exp); setForm({ ...exp, date: exp.date?.split('T')[0] }); setShowForm(true); }} style={{
                          background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8',
                          padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer'
                        }}>
                          ✎ Edit
                        </button>
                        <button onClick={() => handleDelete(exp._id)} style={{
                          background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8',
                          padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer'
                        }}>
                          ✗ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
