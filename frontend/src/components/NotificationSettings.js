import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotificationSettings = ({ userId, token, onClose }) => {
  const [notificationEmail, setNotificationEmail] = useState('');
  const [receiveNotifications, setReceiveNotifications] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, [userId]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(
        'http://localhost:4004/auth/notification-settings',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotificationEmail(response.data.settings.notificationEmail || '');
      setReceiveNotifications(response.data.settings.receiveNotifications ?? true);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.put(
        'http://localhost:4004/auth/notification-email',
        { notificationEmail, receiveNotifications },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setTimeout(() => {
        setLoading(false);
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update settings');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      zIndex: 1000,
      minWidth: '400px',
      maxWidth: '500px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#333' }}>🔔 Notification Settings</h2>
        <button onClick={onClose} style={{
          background: 'none',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          color: '#666'
        }}>×</button>
      </div>

      {success && (
        <div style={{
          background: '#d4edda',
          color: '#155724',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          ✅ Settings saved successfully!
        </div>
      )}

      {error && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
            Email for Notifications
          </label>
          <input
            type="email"
            value={notificationEmail}
            onChange={(e) => setNotificationEmail(e.target.value)}
            placeholder="your-email@gmail.com"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
          <p style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>
            We'll send all notifications (deadlines, overdue milestones, ethics alerts) to this email.
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={receiveNotifications}
              onChange={(e) => setReceiveNotifications(e.target.checked)}
              style={{ marginRight: '10px', width: '20px', height: '20px' }}
            />
            <span style={{ fontWeight: '500', color: '#555' }}>Receive notification emails</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              background: 'white',
              cursor: 'pointer',
              fontWeight: '600',
              color: '#555'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '6px',
              background: '#22c55e',
              cursor: loading ? 'not-allowed' : 'pointer',
              color: 'white',
              fontWeight: '600'
            }}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#fff3cd',
        borderRadius: '6px',
        fontSize: '13px',
        color: '#856404'
      }}>
        <strong>💡 Tip:</strong> Make sure your email is correct. All system notifications will be sent here.
      </div>
    </div>
  );
};

export default NotificationSettings;
