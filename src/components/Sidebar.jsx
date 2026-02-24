import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarDays, FileText, Target, Settings,
  LogOut, Building, Megaphone, Globe, UserCheck,
  ChevronDown, ChevronRight, Star, Bell, BarChart2, Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

const NAV = [
  {
    section: 'Main',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'My Profile', path: '/profile', icon: Users },
    ]
  },
  {
    section: 'Leave & Time',
    items: [
      { label: 'My Leaves', path: '/leaves', icon: CalendarDays },
      { label: 'Holiday Calendar', path: '/holidays', icon: Globe },
    ]
  },
  {
    section: 'Performance',
    items: [
      { label: 'My Goals', path: '/goals', icon: Target },
      { label: 'Reviews', path: '/performance', icon: Star },
    ]
  },
  {
    section: 'Company',
    items: [
      { label: 'Directory', path: '/directory', icon: Building },
      { label: 'Announcements', path: '/announcements', icon: Megaphone },
    ]
  },
];

const MANAGER_NAV = {
  section: 'My Team',
  items: [
    { label: 'Team Overview', path: '/team-dashboard', icon: Users },
    { label: 'Team Leaves', path: '/team-leaves', icon: CalendarDays },
    { label: 'Team Performance', path: '/team-performance', icon: Star },
  ]
};

const ADMIN_NAV = {
  section: 'Administration',
  items: [
    { label: 'Employees', path: '/admin/employees', icon: Users },
    { label: 'Leave Admin', path: '/admin/leaves', icon: CalendarDays },
    { label: 'System Config', path: '/admin/config', icon: Settings },
  ]
};

const HR_NAV = {
  section: 'HR Portal',
  items: [
    { label: 'HR Dashboard', path: '/hr/dashboard', icon: LayoutDashboard },
    { label: 'Leave Oversight', path: '/hr/leaves', icon: CalendarDays },
    { label: 'All Employees', path: '/hr/employees', icon: Users },
    { label: 'Performance', path: '/hr/performance', icon: Star },
    { label: 'HR Reports', path: '/hr/reports', icon: BarChart2 },
  ]
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const isActive = p => location.pathname === p;

  const groups = [...NAV];
  if (user.role === 'manager' || user.role === 'admin') groups.splice(4, 0, MANAGER_NAV);
  if (user.role === 'hr' || user.role === 'admin') groups.push(HR_NAV);
  if (user.role === 'admin') groups.push(ADMIN_NAV);

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">RW</div>
        <div>
          <div className="sidebar-logo-text">Rev Workforce</div>
          <div className="sidebar-logo-sub">HR Management</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {groups.map((grp, i) => (
          <div key={i}>
            <div className="sidebar-section-label">{grp.section}</div>
            {grp.items.map(item => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <div key={item.path} className={`nav-item ${active ? 'active' : ''}`} onClick={() => nav(item.path)}>
                  <Icon size={16} className="nav-icon" />
                  <span style={{ flex: 1 }}>{item.label}</span>
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="sidebar-user">
        <div className="sidebar-user-card">
          <Avatar name={user.name} size="sm" />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
            <div style={{ fontSize: 11, color: 'var(--sidebar-text)', textTransform: 'capitalize' }}>{user.role}</div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            style={{ width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(168,181,204,0.7)', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.18s', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(168,181,204,0.7)'; }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
