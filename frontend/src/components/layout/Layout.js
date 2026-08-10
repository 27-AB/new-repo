import { getServiceUrl } from "../../config/api";
 // Make sure the path is correct
const NOTIF_API = getServiceUrl("notifications");
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ThemeProvider, useTheme } from "../../context/ThemeContext";
import useRoles from "../../hooks/useRoles";
import { SearchBar } from "../ui/SearchBar";

const NAV = [
  { to: "/",            icon: "📊", label: "Dashboard"          },
  { to: "/research",    icon: "🔬", label: "Research Projects"  },
  { to: "/community",   icon: "👥", label: "Community Projects" },
  { to: "/colleges",    icon: "🏛️", label: "Colleges"           },
  { to: "/researchers", icon: "👨‍🔬", label: "Researchers"        },
  { to: "/funding",     icon: "💰", label: "Funding & Grants"   },
  { to: "/reports",     icon: "📄", label: "Reports"            },
  { to: "/settings",    icon: "⚙️", label: "Settings"           },
];

function LayoutContent({ children }) {
  const { user, logout, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const handleLogout = () => { logout(); navigate("/login"); };
  const { isFunder } = useRoles();

  const filteredNav = NAV.filter(item => {
    if (isFunder()) {
      // Hides 'Settings' and 'Funding & Grants' from funder role
      return !['Settings', 'Funding & Grants'].includes(item.label);
    }
    return true;
  });
  // Fetch unread notifications when user is logged in
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user?.id && token) {
        try {
          const res = await fetch(`${NOTIF_API}/user/${user.id}/unread-count`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUnreadCount(data.unreadCount || 0);
          }
        } catch (err) {
          console.error("Failed to fetch notification count:", err);
        }
      }
    };
    fetchUnreadCount();
  }, [user, token]);

  // Fetch notifications when bell is clicked
  const fetchNotifications = async () => {
    if (user?.id && token) {
      try {
        const res = await fetch(`http://localhost:4001/user-notifications/user/${user.id}?limit=20`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (user?.id && token) {
      try {
        await fetch(`http://localhost:4001/user-notifications/user/${user.id}/read-all`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadCount(0);
        setShowNotifications(false);
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }
  };

  // Mark single notification as read
  const markAsRead = async (notificationId) => {
    if (token) {
      try {
        await fetch(`http://localhost:4001/user-notifications/${notificationId}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` }
        });
        // Refresh notifications
        fetchNotifications();
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }
  };

  const sidebarStyle = {
    width: 230, background: "var(--bg-secondary)", borderRight: "1px solid var(--border-color)",
    display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 200,
    fontFamily: "'DM Sans',sans-serif",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)", fontFamily: "'DM Sans',sans-serif" }}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#1d4ed8,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎓</div>
            <div>
              <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 14, lineHeight: 1 }}>ASTU</div>
              <div style={{ color: "var(--text-tertiary)", fontSize: 10, marginTop: 2 }}>Analytics Portal</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {filteredNav.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} end={to === "/"}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                borderRadius: 8, marginBottom: 2, textDecoration: "none", fontSize: 13.5, fontWeight: 500,
                background: isActive ? "rgba(6,182,212,0.1)" : "transparent",
                color: isActive ? "#22d3ee" : "var(--text-secondary)",
                transition: "all .15s",
              })}
            >
              <span style={{ fontSize: 16 }}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: "14px 16px", borderTop: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#1d4ed8,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              {user?.name?.[0] || "U"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</div>
              <div style={{ color: "var(--text-tertiary)", fontSize: 10, textTransform: "capitalize" }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: "100%", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "7px", color: "#f87171", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ marginLeft: 230, flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Topbar */}
        <header style={{ height: 60, background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", padding: "0 28px", position: "sticky", top: 0, zIndex: 100, gap: 16 }}>
          <div style={{ flex: 1, maxWidth: 400 }}>
            <SearchBar placeholder="Search analytics, researchers, reports..." />
          </div>
          <button 
            onClick={toggleTheme}
            style={{ 
              background: "rgba(255,255,255,0.05)", 
              border: "1px solid var(--border-color)", 
              borderRadius: 8, 
              padding: "8px 12px", 
              color: "var(--text-secondary)", 
              fontSize: 13, 
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22d3ee", boxShadow: "0 0 8px #22d3ee" }} />
            <span style={{ color: "var(--text-tertiary)", fontSize: 12 }}>All services online</span>
          </div>
          {/* Notification Bell */}
          <div style={{ position: "relative" }}>
            <button 
              onClick={() => { setShowNotifications(!showNotifications); fetchNotifications(); }}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border-color)",
                borderRadius: 8,
                padding: "8px 12px",
                color: "var(--text-secondary)",
                fontSize: 14,
                cursor: "pointer",
                position: "relative"
              }}
            >
              🔔
            </button>
            {unreadCount > 0 && (
              <span style={{
                position: "absolute",
                top: -8,
                right: -8,
                background: "#ef4444",
                color: "white",
                borderRadius: "50%",
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                border: "2px solid var(--bg-secondary)"
              }}>
                {unreadCount}
              </span>
            )}
          </div>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div style={{
              position: "absolute",
              top: 70,
              right: 28,
              width: 350,
              maxHeight: 400,
              overflowY: "auto",
              background: "var(--bg-primary)",
              border: "1px solid var(--border-color)",
              borderRadius: 12,
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              zIndex: 200
            }}>
              <div style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 13 }}>Notifications</span>
                <button
                  onClick={markAllAsRead}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 11,
                    color: "#22c55e",
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: 4
                  }}
                >
                  Mark all read
                </button>
              </div>
              {notifications.length > 0 ? (
                <div>
                  {notifications.map((notif) => (
                    <div
                      key={notif._id}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid var(--border-color)",
                        background: notif.isRead ? "transparent" : "rgba(34,211,238,0.05)",
                        cursor: "pointer",
                        transition: "background .15s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = notif.isRead ? "transparent" : "rgba(34,211,238,0.1)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = notif.isRead ? "transparent" : "rgba(34,211,238,0.05)"}
                      onClick={() => markAsRead(notif._id)}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{
                          color: notif.isRead ? "var(--text-tertiary)" : "var(--text-primary)",
                          fontWeight: 600,
                          fontSize: 13
                        }}>
                          {notif.title}
                        </span>
                        {!notif.isRead && (
                          <span style={{
                            width: 8,
                            height: 8,
                            background: "#22c55e",
                            borderRadius: "50%",
                            display: "inline-block"
                          }} />
                        )}
                      </div>
                      <p style={{ color: "var(--text-secondary)", fontSize: 12, margin: 0, lineHeight: 1.4 }}>
                        {notif.message}
                      </p>
                      <p style={{ color: "var(--text-tertiary)", fontSize: 10, margin: "4px 0 0 0" }}>
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: "24px", textAlign: "center", color: "var(--text-tertiary)", fontSize: 12 }}>
                  No notifications
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#1d4ed8,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>
              {user?.name?.[0] || "U"}
            </div>
            <div>
              <div style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
              <div style={{ color: "var(--text-tertiary)", fontSize: 11, textTransform: "capitalize" }}>{user?.role}</div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: 28, overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function Layout({ children }) {
  return (
    <ThemeProvider>
      <LayoutContent>{children}</LayoutContent>
    </ThemeProvider>
  );
}
