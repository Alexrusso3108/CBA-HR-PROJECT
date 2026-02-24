import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CalendarDays, TrendingUp, Target, ArrowRight, Building, FileText } from 'lucide-react';
import Layout from '../../components/Layout';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';
import {
  getEmployees, getLeaveApplications, getPerformanceReviews,
  getDepartments, getLeaveBalance, getGoals,
} from '../../store/dataStore';

export default function HRDashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const employees = getEmployees();
  const activeEmps = employees.filter(e => e.status === 'active');
  const departments = getDepartments();
  const allLeaves = getLeaveApplications({});
  const allReviews = getPerformanceReviews({});
  const allGoals = getGoals({});

  const pendingLeaves = allLeaves.filter(l => l.status === 'pending');
  const approvedToday = allLeaves.filter(l => l.status === 'approved' && l.fromDate <= today && l.toDate >= today);
  const pendingReviews = allReviews.filter(r => r.status === 'submitted');

  // Dept headcount
  const deptBreakdown = useMemo(() => departments.map(d => ({
    ...d,
    count: activeEmps.filter(e => e.departmentId === d.id).length,
  })).filter(d => d.count > 0).sort((a, b) => b.count - a.count), [activeEmps, departments]);

  // Recent leave applications
  const recentLeaves = [...allLeaves].reverse().slice(0, 6);

  // Upcoming joinings this year
  const newJoinees = employees
    .filter(e => e.joiningDate?.startsWith(new Date().getFullYear()))
    .sort((a, b) => new Date(b.joiningDate) - new Date(a.joiningDate));

  const roleMap = { employee: 'Employee', manager: 'Manager', admin: 'Admin', hr: 'HR' };

  return (
    <Layout title="HR Dashboard">
      {/* Welcome */}
      <div className="welcome-banner" style={{ marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: -100, right: -60, pointerEvents: 'none' }} />
        <Avatar name={user.name} size="lg" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.8, marginBottom: 4, letterSpacing: 0.2 }}>HR Manager</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 3 }}>{user.name}</div>
          <div style={{ fontSize: 13, opacity: 0.7 }}>{user.id} &nbsp;·&nbsp; Human Resources</div>
        </div>
        <div style={{ display: 'flex', gap: 20, textAlign: 'center' }}>
          {[
            { label: 'Total Employees', value: activeEmps.length },
            { label: 'On Leave Today', value: approvedToday.length },
            { label: 'Pending Requests', value: pendingLeaves.length },
          ].map(s => (
            <div key={s.label} style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.13)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: 11, opacity: 0.75, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Active Employees', value: activeEmps.length, icon: Users, color: '#4f46e5', bg: '#eef2ff' },
          { label: 'Open Leave Requests', value: pendingLeaves.length, icon: CalendarDays, color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Pending Reviews', value: pendingReviews.length, icon: FileText, color: '#0ea5e9', bg: '#f0f9ff' },
          { label: 'Departments', value: departments.length, icon: Building, color: '#10b981', bg: '#f0fdf4' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card">
              <div style={{ width: 46, height: 46, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Dept Headcount */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.6 }}>Headcount by Department</div>
            <button onClick={() => nav('/hr/reports')} style={{ fontSize: 12, color: '#4f46e5', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              Full Report <ArrowRight size={12} />
            </button>
          </div>
          {deptBreakdown.map(d => {
            const pct = Math.round((d.count / activeEmps.length) * 100);
            return (
              <div key={d.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>{d.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#4f46e5' }}>{d.count} <span style={{ color: '#94a3b8', fontWeight: 400 }}>({pct}%)</span></span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
              </div>
            );
          })}
        </div>

        {/* Recent Leave Requests */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.6 }}>Recent Leave Requests</div>
            <button onClick={() => nav('/hr/leaves')} style={{ fontSize: 12, color: '#4f46e5', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              Manage all <ArrowRight size={12} />
            </button>
          </div>
          {recentLeaves.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}><CalendarDays size={36} color="#cbd5e1" /><p>No leave applications</p></div>
          ) : (
            recentLeaves.map(l => {
              const emp = employees.find(e => e.id === l.employeeId);
              return (
                <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <Avatar name={emp?.name || '?'} size="sm" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{emp?.name || l.employeeId}</div>
                    <div style={{ fontSize: 11.5, color: '#64748b' }}>{l.type} &nbsp;·&nbsp; {l.fromDate} &ndash; {l.toDate}</div>
                  </div>
                  <Badge status={l.status} />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.6 }}>Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Leave Oversight', icon: CalendarDays, path: '/hr/leaves', color: '#4f46e5', bg: '#eef2ff' },
            { label: 'All Employees', icon: Users, path: '/hr/employees', color: '#10b981', bg: '#f0fdf4' },
            { label: 'Performance', icon: TrendingUp, path: '/hr/performance', color: '#f59e0b', bg: '#fffbeb' },
            { label: 'HR Reports', icon: Target, path: '/hr/reports', color: '#0ea5e9', bg: '#f0f9ff' },
          ].map(a => {
            const Icon = a.icon;
            return (
              <button key={a.label} onClick={() => nav(a.path)}
                style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '13px', borderRadius: 10, background: a.bg, border: '1.5px solid transparent', cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'inherit', textAlign: 'left' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${a.color}40`; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 4px 14px ${a.color}18`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 9, background: `${a.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} color={a.color} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* New Joinings */}
      {newJoinees.length > 0 && (
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.6 }}>New Joinings This Year</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
            {newJoinees.map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#f8faff', borderRadius: 10, border: '1px solid #e0e7ff' }}>
                <Avatar name={e.name} size="md" />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', marginBottom: 1 }}>{e.name}</div>
                  <div style={{ fontSize: 11.5, color: '#64748b' }}>{roleMap[e.role]} &nbsp;·&nbsp; Joined {e.joiningDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
