import React, { useState, useEffect } from 'react';

const NotificationBadge = ({ userId, token }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (userId && token) {
      fetchUnreadCount();
    }
  }, [userId, token]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(
        `http://localhost:4001/user-notifications/user/${userId}/unread-count`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (response.ok) {
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `http://localhost:4001/user-notifications/user/${userId}?limit=20&unreadOnly=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (response.ok) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `http://localhost:4001/user-notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.ok) {
        // Refresh notifications
        fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        `http://localhost:4001/user-notifications/user/${userId}/read-all`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.ok) {
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={fetchNotifications}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          padding: '8px',
          color: '#666'
        }}
        title="Notifications"
      >
        🔔
      </button>
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          background: '#ef4444',
          color: 'white',
          borderRadius: '50%',
          minWidth: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 'bold',
          padding: '0 4px'
        }}>
          {unreadCount}
        </span>
      )}

      {/* Notifications Dropdown */}
      {notifications.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '45px',
          right: 0,
          width: '350px',
          maxHeight: '400px',
          overflowY: 'auto',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontWeight: '600' }}>Notifications</span>
            <button
              onClick={markAllAsRead}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '12px',
                color: '#22c55e',
                cursor: 'pointer'
              }}
            >
              Mark all read
            </button>
          </div>
          <div>
            {notifications.map((notif) => (
              <div
                key={notif._id}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f0f0f0',
                  background: notif.isRead ? 'white' : '#f9fafb',
                  cursor: 'pointer'
                }}
                onClick={() => markAsRead(notif._id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{
                    fontWeight: '600',
                    color: notif.isRead ? '#666' : '#333'
                  }}>
                    {notif.title}
                  </span>
                  {!notif.isRead && (
                    <span style={{
                      width: '8px',
                      height: '8px',
                      background: '#22c55e',
                      borderRadius: '50%',
                      display: 'inline-block'
                    }} />
                  )}
                </div>
                <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>{notif.message}</p>
                <p style={{ color: '#999', fontSize: '11px', margin: '4px 0 0 0' }}>
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBadge;
