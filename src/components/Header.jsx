import { useState, useRef, useEffect } from 'react';
import { Bell, CalendarDays, Star, Megaphone, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { markNotificationRead, markAllNotificationsRead, getNotifications } from '../store/dataStore';
import Avatar from './Avatar';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const NOTIF_ICONS = {
  leave_applied: { icon: CalendarDays, bg: '#eef2ff', color: '#4f46e5' },
  leave_approved: { icon: CalendarDays, bg: '#f0fdf4', color: '#10b981' },
  leave_rejected: { icon: CalendarDays, bg: '#fff5f5', color: '#ef4444' },
  review_submitted: { icon: Star, bg: '#fffbeb', color: '#f59e0b' },
  review_feedback: { icon: Star, bg: '#f0f9ff', color: '#0ea5e9' },
  announcement: { icon: Megaphone, bg: '#f5f3ff', color: '#7c3aed' },
  system: { icon: Settings, bg: '#f8fafc', color: '#64748b' },
};

export default function Header({ title }) {
  const { user, unreadCount, refreshNotifications } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const panelRef = useRef(null);
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    if (showNotif) setNotifs(getNotifications(user.id));
  }, [showNotif, user.id]);

  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setShowNotif(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleMarkAll() {
    markAllNotificationsRead(user.id);
    setNotifs(getNotifications(user.id));
    refreshNotifications();
  }

  function handleNotifClick(n) {
    if (!n.read) {
      markNotificationRead(n.id);
      setNotifs(getNotifications(user.id));
      refreshNotifications();
    }
  }

  return (
    <header className="top-header">
      <h2 className="header-title">{title}</h2>

      <div className="header-actions">
        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={panelRef}>
          <button className="icon-btn" id="notifications-btn" onClick={() => setShowNotif(s => !s)} aria-label="Notifications">
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }} />
            )}
          </button>

          {showNotif && (
            <div className="notif-panel">
              <div className="notif-header">
                <span style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  Notifications
                  {unreadCount > 0 && (
                    <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99 }}>{unreadCount}</span>
                  )}
                </span>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAll} style={{ fontSize: 12, color: '#4f46e5', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notif-list">
                {notifs.length === 0 ? (
                  <div className="empty-state" style={{ padding: 40 }}>
                    <Bell size={36} color="#cbd5e1" />
                    <p style={{ fontSize: 13, color: '#94a3b8' }}>No notifications</p>
                  </div>
                ) : (
                  notifs.map(n => {
                    const cfg = NOTIF_ICONS[n.type] || NOTIF_ICONS.system;
                    const Icon = cfg.icon;
                    return (
                      <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`} onClick={() => handleNotifClick(n)}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={15} color={cfg.color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="notif-text" style={{ fontWeight: n.read ? 400 : 600 }}>{n.message}</div>
                          <div className="notif-time">{timeAgo(n.createdAt)}</div>
                        </div>
                        {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4f46e5', flexShrink: 0, alignSelf: 'center' }} />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', borderRadius: 9, background: '#f8faff', border: '1px solid #e0e7ff', cursor: 'default' }}>
          <Avatar name={user.name} size="sm" />
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{user.name}</div>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>{user.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
