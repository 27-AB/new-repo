import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getServiceUrl } from '../../config/api';

export default function NotificationCenter({ onClose, serviceType = 'research' }) {
  const API = getServiceUrl(serviceType);
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState(null);
  const [testEmail, setTestEmail] = useState('abrahamgebreyohannes12@gmail.com');
  const [customEmail, setCustomEmail] = useState({
    to: 'abrahamgebreyohannes12@gmail.com',
    subject: '',
    message: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch(`${API}/notifications/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const sendTestEmail = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API}/notifications/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email: testEmail })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ Test email sent successfully to ${testEmail}!`);
      } else {
        setMessage(`❌ Failed: ${data.error || data.message}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const runCheck = async (type) => {
    setLoading(true);
    setMessage('');
    try {
      const endpoint = type === 'all' ? '/notifications/check/all' : `/notifications/check/${type}`;
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        if (type === 'all') {
          const total = (data.results.deadlines?.emailsSent || 0) + 
                       (data.results.overdue?.alertsSent || 0) + 
                       (data.results.ethics?.emailsSent || 0);
          setMessage(`✅ All checks completed! ${total} notification(s) sent.`);
        } else {
          const count = data.emailsSent || data.alertsSent || 0;
          setMessage(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} check completed! ${count} notification(s) sent.`);
        }
      } else {
        setMessage(`❌ Failed: ${data.message}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendCustomNotification = async () => {
    if (!customEmail.to || !customEmail.subject || !customEmail.message) {
      setMessage('❌ Please fill in all fields');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API}/notifications/custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(customEmail)
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ Custom notification sent to ${customEmail.to}!`);
        setCustomEmail({ to: 'abrahamgebreyohannes12@gmail.com', subject: '', message: '' });
      } else {
        setMessage(`❌ Failed: ${data.error || data.message}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.75)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        background: '#0d1b2a',
        borderRadius: 16,
        padding: 32,
        width: '100%',
        maxWidth: 800,
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ color: '#e2e8f0', fontSize: 22, fontWeight: 700, margin: 0 }}>
            🔔 Notification Center
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: 24,
              cursor: 'pointer',
              padding: 0,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {message && (
          <div style={{
            background: message.startsWith('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${message.startsWith('✅') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 20,
            color: message.startsWith('✅') ? '#4ade80' : '#f87171',
            fontSize: 14
          }}>
            {message}
          </div>
        )}

        {/* Settings Overview */}
        {settings && (
          <div style={{
            background: 'rgba(34,211,238,0.1)',
            border: '1px solid rgba(34,211,238,0.2)',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24
          }}>
            <h3 style={{ color: '#22d3ee', fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 12 }}>
              📊 System Status
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, color: '#94a3b8', fontSize: 13 }}>
              <div>
                <strong style={{ color: '#e2e8f0' }}>Email Enabled:</strong>{' '}
                {settings.emailEnabled ? '✅ Yes' : '❌ No'}
              </div>
              <div>
                <strong style={{ color: '#e2e8f0' }}>Alert Email:</strong>{' '}
                {settings.alertEmail}
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <strong style={{ color: '#e2e8f0' }}>Scheduled Checks:</strong>
                <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                  <li>Deadlines: {settings.schedules.deadlineCheck}</li>
                  <li>Overdue: {settings.schedules.overdueCheck}</li>
                  <li>Ethics: {settings.schedules.ethicsCheck}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 12 }}>
            🚀 Quick Actions
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <button
              onClick={() => runCheck('deadlines')}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                border: 'none',
                borderRadius: 8,
                padding: '12px 16px',
                color: 'white',
                fontSize: 13,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'transform 0.1s'
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              ⏰ Check Deadlines
            </button>
            <button
              onClick={() => runCheck('overdue')}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                border: 'none',
                borderRadius: 8,
                padding: '12px 16px',
                color: 'white',
                fontSize: 13,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'transform 0.1s'
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              🚨 Check Overdue
            </button>
            <button
              onClick={() => runCheck('ethics')}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: 8,
                padding: '12px 16px',
                color: 'white',
                fontSize: 13,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'transform 0.1s'
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              🛡️ Check Ethics
            </button>
            <button
              onClick={() => runCheck('all')}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                border: 'none',
                borderRadius: 8,
                padding: '12px 16px',
                color: 'white',
                fontSize: 13,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'transform 0.1s'
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              🔍 Run All Checks
            </button>
          </div>
        </div>

        {/* Test Email */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24
        }}>
          <h3 style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 12 }}>
            📧 Send Test Email
          </h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="email"
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              placeholder="recipient@email.com"
              style={{
                flex: 1,
                background: '#0f1824',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#e2e8f0',
                fontSize: 13,
                outline: 'none'
              }}
            />
            <button
              onClick={sendTestEmail}
              disabled={loading}
              style={{
                background: '#10b981',
                border: 'none',
                borderRadius: 8,
                padding: '10px 24px',
                color: 'white',
                fontSize: 13,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                whiteSpace: 'nowrap'
              }}
            >
              {loading ? '⏳ Sending...' : '📤 Send Test'}
            </button>
          </div>
        </div>

        {/* Custom Notification */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: 20
        }}>
          <h3 style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 12 }}>
            ✉️ Send Custom Notification
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="email"
              value={customEmail.to}
              onChange={e => setCustomEmail({ ...customEmail, to: e.target.value })}
              placeholder="To: recipient@email.com"
              style={{
                background: '#0f1824',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#e2e8f0',
                fontSize: 13,
                outline: 'none'
              }}
            />
            <input
              type="text"
              value={customEmail.subject}
              onChange={e => setCustomEmail({ ...customEmail, subject: e.target.value })}
              placeholder="Subject"
              style={{
                background: '#0f1824',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#e2e8f0',
                fontSize: 13,
                outline: 'none'
              }}
            />
            <textarea
              value={customEmail.message}
              onChange={e => setCustomEmail({ ...customEmail, message: e.target.value })}
              placeholder="Message"
              rows={4}
              style={{
                background: '#0f1824',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#e2e8f0',
                fontSize: 13,
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            <button
              onClick={sendCustomNotification}
              disabled={loading}
              style={{
                background: '#6366f1',
                border: 'none',
                borderRadius: 8,
                padding: '12px 24px',
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '⏳ Sending...' : '📨 Send Custom Notification'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div style={{
          marginTop: 20,
          padding: 16,
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 8
        }}>
          <p style={{ color: '#94a3b8', fontSize: 12, margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: '#e2e8f0' }}>💡 How it works:</strong><br />
            • Automated checks run daily (Deadlines: 9 AM, Overdue: 10 AM, Ethics: 8 AM)<br />
            • Manual checks can be triggered anytime using the buttons above<br />
            • All notifications are sent to: {settings?.alertEmail || 'abrahamgebreyohannes12@gmail.com'}<br />
            • Escalations are automatic when milestones are 14+ days overdue
          </p>
        </div>
      </div>
    </div>
  );
}
