import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getServiceUrl } from '../../config/api';

const DARK = '#0d1b2a';
const SURFACE = '#162030';
const BORDER = 'rgba(255,255,255,0.07)';
const ACCENT = '#22d3ee';

const ETHICS_STATUS = {
  not_required: { color: '#64748b', bg: 'rgba(100,116,139,0.12)', label: 'Not Required', icon: '⚪' },
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Pending', icon: '⏳' },
  approved: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Approved', icon: '✅' },
  expired: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'Expired', icon: '🚨' },
  rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'Rejected', icon: '❌' },
};

const fmt = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function EthicsComplianceManager({ projectId, projectTitle, onClose, serviceType = 'research' }) {
  const { token } = useAuth();
  const [ethics, setEthics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    ethicsApprovalNumber: '',
    ethicsApprovalDate: '',
    ethicsExpiryDate: '',
    ethicsStatus: 'not_required',
    irbInstitution: '',
    ethicsNotes: ''
  });

  const API = getServiceUrl(serviceType);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/ethics/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEthics(data.ethics);
        setForm({
          ethicsApprovalNumber: data.ethics.approvalNumber || '',
          ethicsApprovalDate: data.ethics.approvalDate?.split('T')[0] || '',
          ethicsExpiryDate: data.ethics.expiryDate?.split('T')[0] || '',
          ethicsStatus: data.ethics.status || 'not_required',
          irbInstitution: data.ethics.institution || '',
          ethicsNotes: data.ethics.notes || ''
        });
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
      const res = await fetch(`${API}/ethics/project/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (data.success) {
        setEditing(false);
        load();
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const handleToggleLock = async (lock) => {
    if (lock && !window.confirm('Are you sure you want to lock this project financially?')) return;
    if (!lock && !window.confirm('Are you sure you want to unlock this project?')) return;

    try {
      const res = await fetch(`${API}/ethics/project/${projectId}/toggle-lock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ lock, reason: 'manual_lock' })
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

  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
      }}>
        <div style={{ color: '#64748b', fontSize: 16 }}>Loading...</div>
      </div>
    );
  }

  const s = ETHICS_STATUS[ethics?.status] || ETHICS_STATUS.not_required;
  const isExpired = ethics?.isExpired;
  const daysUntil = ethics?.daysUntilExpiry;
  const showWarning = daysUntil !== null && daysUntil >= 0 && daysUntil <= 30;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: 20
    }}>
      <div style={{
        background: DARK, border: `1px solid ${BORDER}`, borderRadius: 16,
        maxWidth: 800, width: '100%', maxHeight: '90vh', overflow: 'hidden',
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
              🛡️ Ethics & Compliance (IRB)
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

          {/* Status Summary */}
          <div style={{
            background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12,
            padding: 20, marginBottom: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 600, margin: 0 }}>
                Current Status
              </h3>
              <span style={{
                background: s.bg, color: s.color, padding: '4px 12px',
                borderRadius: 8, fontSize: 12, fontWeight: 700
              }}>
                {s.icon} {s.label}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, color: '#94a3b8', fontSize: 13 }}>
              <div>
                <strong>Approval Number:</strong><br />
                {ethics?.approvalNumber || '—'}
              </div>
              <div>
                <strong>Institution:</strong><br />
                {ethics?.institution || '—'}
              </div>
              <div>
                <strong>Approval Date:</strong><br />
                {fmt(ethics?.approvalDate)}
              </div>
              <div>
                <strong>Expiry Date:</strong><br />
                {fmt(ethics?.expiryDate)}
              </div>
            </div>

            {/* Expiry Warning */}
            {isExpired && (
              <div style={{
                marginTop: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 8, padding: '12px 16px', color: '#fca5a5', fontSize: 13
              }}>
                <strong>🚨 Ethics Approval Expired!</strong><br />
                Expired {Math.abs(daysUntil)} days ago. Project should be locked until renewed.
              </div>
            )}

            {showWarning && !isExpired && (
              <div style={{
                marginTop: 12, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: 8, padding: '12px 16px', color: '#fbbf24', fontSize: 13
              }}>
                <strong>⚠️ Expiring Soon!</strong><br />
                Ethics approval expires in {daysUntil} day{daysUntil !== 1 ? 's' : ''}. Please renew.
              </div>
            )}

            {/* Lock Status */}
            {ethics?.isLocked && (
              <div style={{
                marginTop: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 8, padding: '12px 16px', color: '#fca5a5', fontSize: 13
              }}>
                <strong>🔒 Project Financially Locked</strong><br />
                Reason: {ethics.lockReason.replace('_', ' ')}
              </div>
            )}

            {ethics?.notes && (
              <div style={{
                marginTop: 12, padding: 12, background: 'rgba(255,255,255,0.02)',
                borderRadius: 8, color: '#94a3b8', fontSize: 12, fontStyle: 'italic'
              }}>
                <strong>Notes:</strong> {ethics.notes}
              </div>
            )}
          </div>

          {/* Edit Form */}
          {!editing ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEditing(true)} style={{
                background: ACCENT, border: 'none', color: DARK, padding: '10px 20px',
                borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}>
                ✎ Edit Ethics Information
              </button>

              {ethics?.isLocked ? (
                <button onClick={() => handleToggleLock(false)} style={{
                  background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                  color: '#10b981', padding: '10px 20px', borderRadius: 8,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer'
                }}>
                  🔓 Unlock Project
                </button>
              ) : (
                <button onClick={() => handleToggleLock(true)} style={{
                  background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#ef4444', padding: '10px 20px', borderRadius: 8,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer'
                }}>
                  🔒 Lock Project
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{
              background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12,
              padding: 20
            }}>
              <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
                Edit Ethics & Compliance Information
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, fontWeight: 600, marginBottom: 5 }}>
                    ETHICS STATUS *
                  </label>
                  <select required value={form.ethicsStatus}
                    onChange={e => setForm({ ...form, ethicsStatus: e.target.value })}
                    style={{
                      width: '100%', background: '#0f1824', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8, padding: '9px 12px', color: '#e2e8f0', fontSize: 13
                    }}>
                    <option value="not_required">Not Required</option>
                    <option value="pending">Pending Approval</option>
                    <option value="approved">Approved</option>
                    <option value="expired">Expired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, fontWeight: 600, marginBottom: 5 }}>
                    APPROVAL NUMBER
                  </label>
                  <input value={form.ethicsApprovalNumber}
                    onChange={e => setForm({ ...form, ethicsApprovalNumber: e.target.value })}
                    placeholder="IRB-2026-001"
                    style={{
                      width: '100%', background: '#0f1824', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8, padding: '9px 12px', color: '#e2e8f0', fontSize: 13
                    }} />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, fontWeight: 600, marginBottom: 5 }}>
                    IRB INSTITUTION
                  </label>
                  <input value={form.irbInstitution}
                    onChange={e => setForm({ ...form, irbInstitution: e.target.value })}
                    placeholder="ASTU IRB"
                    style={{
                      width: '100%', background: '#0f1824', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8, padding: '9px 12px', color: '#e2e8f0', fontSize: 13
                    }} />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, fontWeight: 600, marginBottom: 5 }}>
                    APPROVAL DATE
                  </label>
                  <input type="date" value={form.ethicsApprovalDate}
                    onChange={e => setForm({ ...form, ethicsApprovalDate: e.target.value })}
                    style={{
                      width: '100%', background: '#0f1824', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8, padding: '9px 12px', color: '#e2e8f0', fontSize: 13
                    }} />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, fontWeight: 600, marginBottom: 5 }}>
                    EXPIRY DATE
                  </label>
                  <input type="date" value={form.ethicsExpiryDate}
                    onChange={e => setForm({ ...form, ethicsExpiryDate: e.target.value })}
                    style={{
                      width: '100%', background: '#0f1824', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8, padding: '9px 12px', color: '#e2e8f0', fontSize: 13
                    }} />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, fontWeight: 600, marginBottom: 5 }}>
                    NOTES
                  </label>
                  <textarea value={form.ethicsNotes}
                    onChange={e => setForm({ ...form, ethicsNotes: e.target.value })}
                    rows={3}
                    placeholder="Additional notes about ethics approval..."
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
                  Save Changes
                </button>
                <button type="button" onClick={() => setEditing(false)} style={{
                  background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8',
                  padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer'
                }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
