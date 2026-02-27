import { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Target, FileText, Users, ArrowRight, CheckCircle2, Clock, XCircle, TrendingUp, Award, Megaphone } from 'lucide-react';
import Layout from '../components/Layout';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useCompanyData } from '../hooks/useCompanyData';

export default function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();

  // Supabase data
  const [bal, setBal] = useState({ CL: 0, SL: 0, PL: 0 });
  const [myLeaves, setMyLeaves] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Company-wide (for birthdays/anniversaries/directory)
  const { employees: allEmployees, loading } = useCompanyData();
  const employees = allEmployees.filter(e => e.status === 'active');

  // Goals & reviews (local stub — will be empty for new employees)
  const myGoals = [];
  const myReviews = [];

  const fetchMyData = useCallback(async () => {
    if (!user?.id || !user?.company_id) return;
    try {
      const [balRes, leavesRes, annRes] = await Promise.all([
        supabase.from('leave_balances').select('*').eq('employee_id', user.id).eq('company_id', user.company_id).single(),
        supabase.from('leave_applications').select('*').eq('employee_id', user.id).eq('company_id', user.company_id).order('applied_on', { ascending: false }),
        supabase.from('announcements').select('*').eq('company_id', user.company_id).order('created_at', { ascending: false }).limit(3),
      ]);
      if (balRes.data) setBal({ CL: balRes.data.cl ?? 0, SL: balRes.data.sl ?? 0, PL: balRes.data.pl ?? 0 });
      setMyLeaves((leavesRes.data || []).map(l => ({ id: l.id, type: l.type, fromDate: l.from_date, toDate: l.to_date, status: l.status, appliedOn: l.applied_on })));
      setAnnouncements(annRes.data || []);
    } catch (err) {
      console.error('Dashboard fetchMyData error:', err);
    }
  }, [user?.id, user?.company_id]);

  useEffect(() => { fetchMyData(); }, [fetchMyData]);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const birthdays = useMemo(() => employees.filter(e =>
    e.id !== user.id && e.dob && new Date(e.dob).getMonth() === today.getMonth() && new Date(e.dob).getDate() === today.getDate()
  ), [employees]);

  const upcomingBirthdays = useMemo(() => employees
    .filter(e => e.id !== user.id && e.dob)
    .filter(e => {
      const d = new Date(e.dob);
      const next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
      if (next < today) next.setFullYear(today.getFullYear() + 1);
      return Math.ceil((next - today) / 86400000) <= 14;
    })
    .sort((a, b) => {
      const da = new Date(a.dob), db = new Date(b.dob);
      return (da.getMonth() * 31 + da.getDate()) - (db.getMonth() * 31 + db.getDate());
    }).slice(0, 5), [employees]);

  const anniversaries = useMemo(() => employees.filter(e =>
    e.id !== user.id && e.joiningDate &&
    new Date(e.joiningDate).getMonth() === today.getMonth() &&
    new Date(e.joiningDate).getDate() === today.getDate()
  ), [employees]);

  const completedGoals = myGoals.filter(g => g.status === 'completed').length;
  const onLeave = myLeaves.some(l => l.status === 'approved' && l.fromDate <= todayStr && l.toDate >= todayStr);
  const totalGoalProgress = myGoals.length > 0 ? Math.round(myGoals.reduce((a, g) => a + g.progress, 0) / myGoals.length) : 0;

  const leaveStatusIcons = {
    approved: <CheckCircle2 size={15} color="#10b981" />,
    pending: <Clock size={15} color="#f59e0b" />,
    rejected: <XCircle size={15} color="#ef4444" />,
  };

  const greeting = () => {
    const h = today.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Layout title="Dashboard">
      {/* Welcome Banner */}
      <div className="welcome-banner" style={{ position: 'relative', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 'inherit' }}>
          <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: -100, right: -60 }} />
        </div>
        <Avatar name={user.name} size="lg" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500, opacity: 0.8, marginBottom: 4, letterSpacing: 0.2 }}>{greeting()}</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 3 }}>{user.name}</div>
          <div style={{ fontSize: 13, opacity: 0.7, fontWeight: 400 }}>{user.employeeCode || user.id} &nbsp;·&nbsp; {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
        </div>
        {onLeave && (
          <div style={{ padding: '7px 16px', background: 'rgba(255,255,255,0.18)', borderRadius: 8, fontSize: 12.5, fontWeight: 600, border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
            Currently on leave
          </div>
        )}
      </div>

      {/* Leave Balance Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Casual Leave', value: bal.CL, sub: 'days remaining', icon: CalendarDays, color: '#4f46e5', bg: '#eef2ff' },
          { label: 'Sick Leave', value: bal.SL, sub: 'days remaining', icon: FileText, color: '#0ea5e9', bg: '#f0f9ff' },
          { label: 'Paid Leave', value: bal.PL, sub: 'days remaining', icon: Award, color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Goals Completed', value: `${completedGoals}/${myGoals.length}`, sub: 'this year', icon: Target, color: '#10b981', bg: '#f0fdf4' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card">
              <div style={{ width: 46, height: 46, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{s.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Quick Actions */}
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.6 }}>Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Apply for Leave', icon: CalendarDays, path: '/leaves', color: '#4f46e5', bg: '#eef2ff' },
              { label: 'Add New Goal', icon: Target, path: '/goals', color: '#10b981', bg: '#f0fdf4' },
              { label: 'Performance', icon: TrendingUp, path: '/performance', color: '#f59e0b', bg: '#fffbeb' },
              { label: 'Directory', icon: Users, path: '/directory', color: '#0ea5e9', bg: '#f0f9ff' },
            ].map(a => {
              const Icon = a.icon;
              return (
                <button key={a.label} onClick={() => nav(a.path)}
                  style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '13px', borderRadius: 10, background: a.bg, border: `1.5px solid transparent`, cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'inherit', textAlign: 'left' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${a.color}40`; e.currentTarget.style.boxShadow = `0 4px 14px ${a.color}18`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: `${a.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color={a.color} />
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: '#1e293b' }}>{a.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Goal Progress */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.6 }}>Goals Progress</div>
            <button onClick={() => nav('/goals')} style={{ fontSize: 12, color: '#4f46e5', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={12} />
            </button>
          </div>
          {myGoals.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <Target size={36} color="#cbd5e1" />
              <p>No goals set for this year</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 14, padding: '12px 16px', background: '#f8faff', borderRadius: 10, border: '1px solid #e0e7ff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a' }}>Overall Progress</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: '#4f46e5' }}>{totalGoalProgress}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${totalGoalProgress}%` }} /></div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 5 }}>{completedGoals} of {myGoals.length} goals completed</div>
              </div>
              {myGoals.slice(0, 3).map(g => (
                <div key={g.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12.5, color: '#334155', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '72%' }}>{g.description}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5' }}>{g.progress}%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${g.progress}%` }} /></div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Recent Leaves */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.6 }}>Recent Leave Applications</div>
            <button onClick={() => nav('/leaves')} style={{ fontSize: 12, color: '#4f46e5', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={12} />
            </button>
          </div>
          {myLeaves.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <CalendarDays size={36} color="#cbd5e1" />
              <p>No leave applications yet</p>
            </div>
          ) : (
            myLeaves.slice(-4).reverse().map(l => (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: l.status === 'approved' ? '#f0fdf4' : l.status === 'pending' ? '#fffbeb' : '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {leaveStatusIcons[l.status]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{l.type} Leave</div>
                  <div style={{ fontSize: 11.5, color: '#64748b' }}>{l.fromDate} — {l.toDate}</div>
                </div>
                <Badge status={l.status} />
              </div>
            ))
          )}
        </div>

        {/* Announcements */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.6 }}>Company Announcements</div>
            <button onClick={() => nav('/announcements')} style={{ fontSize: 12, color: '#4f46e5', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={12} />
            </button>
          </div>
          {announcements.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <Megaphone size={36} color="#cbd5e1" />
              <p>No announcements</p>
            </div>
          ) : (
            announcements.map(a => (
              <div key={a.id} style={{ padding: '12px 14px', marginBottom: 10, borderRadius: 10, background: a.priority === 'high' ? '#fff5f5' : a.priority === 'medium' ? '#fffbeb' : '#f8faff', border: `1px solid ${a.priority === 'high' ? '#fecaca' : a.priority === 'medium' ? '#fde68a' : '#e0e7ff'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{a.title}</span>
                  <span className={`badge badge-${a.priority}`}>{a.priority}</span>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{a.content.slice(0, 90)}{a.content.length > 90 ? '...' : ''}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Birthdays & Anniversaries */}
      {(birthdays.length > 0 || upcomingBirthdays.length > 0 || anniversaries.length > 0) && (
        <div className="grid-2">
          {(birthdays.length > 0 || upcomingBirthdays.length > 0) && (
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.6 }}>Upcoming Birthdays</div>
              {birthdays.length > 0 && (
                <div style={{ padding: '11px 14px', background: '#fffbeb', borderRadius: 9, border: '1px solid #fde68a', marginBottom: 12 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: '#d97706', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Today</div>
                  {birthdays.map(e => (
                    <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <Avatar name={e.name} size="sm" />
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a' }}>{e.name}</span>
                    </div>
                  ))}
                </div>
              )}
              {upcomingBirthdays.map(e => {
                const d = new Date(e.dob);
                const next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
                if (next < today) next.setFullYear(today.getFullYear() + 1);
                const daysLeft = Math.ceil((next - today) / 86400000);
                return (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <Avatar name={e.name} size="sm" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{e.name}</div>
                      <div style={{ fontSize: 11.5, color: '#64748b' }}>{d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                    </div>
                    <span style={{ fontSize: 11.5, color: '#f59e0b', fontWeight: 700, background: '#fffbeb', padding: '3px 8px', borderRadius: 6, border: '1px solid #fde68a' }}>
                      in {daysLeft}d
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {anniversaries.length > 0 && (
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.6 }}>Work Anniversaries Today</div>
              {anniversaries.map(e => {
                const years = today.getFullYear() - new Date(e.joiningDate).getFullYear();
                return (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <Avatar name={e.name} size="md" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{e.name}</div>
                      <div style={{ fontSize: 12.5, color: '#64748b' }}>Completing {years} {years === 1 ? 'year' : 'years'} at the company</div>
                    </div>
                    <Award size={20} color="#f59e0b" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
