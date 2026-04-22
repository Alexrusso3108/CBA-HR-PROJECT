import { Users, TrendingUp, CalendarDays, Target } from 'lucide-react';
import Layout from '../../components/Layout';
import Avatar from '../../components/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useCompanyData } from '../../hooks/useCompanyData';

export default function TeamDashboard() {
  const { user } = useAuth();
  const { employees, leaveApplications, designations, departments, loading } = useCompanyData();

  const team = employees.filter(e => e.managerId === user.id);
  const teamIds = team.map(e => e.id);

  const today = new Date().toISOString().split('T')[0];
  const teamLeaves = leaveApplications.filter(a => teamIds.includes(a.employeeId));
  const onLeaveToday = teamLeaves.filter(a => a.status === 'approved' && a.fromDate <= today && a.toDate >= today);

  return (
    <Layout title="Team Dashboard">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Team Overview</h1>
          <p>Monitor your team's attendance, goals, and overall activity</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Team Size', value: loading ? '…' : team.length, icon: Users, color: '#6c63ff', sub: 'Direct reports' },
          { label: 'On Leave Today', value: loading ? '…' : onLeaveToday.length, icon: CalendarDays, color: '#fc5c7d', sub: 'Approved' },
          { label: 'Total Leaves', value: loading ? '…' : teamLeaves.length, icon: Target, color: '#38ef7d', sub: `${teamLeaves.filter(l => l.status === 'approved').length} approved` },
          { label: 'Pending Approval', value: loading ? '…' : teamLeaves.filter(l => l.status === 'pending').length, icon: TrendingUp, color: '#f6ad55', sub: 'Awaiting your review' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: `${s.color}18` }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Team Members */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 16 }}>Team Members</div>
          {loading ? (
            <div className="empty-state" style={{ padding: 24 }}><p>Loading…</p></div>
          ) : team.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}><Users size={36} color="#cbd5e1" /><p>No team members assigned</p></div>
          ) : (
            team.map(emp => {
              const des = designations.find(d => d.id === emp.designationId);
              const dept = departments.find(d => d.id === emp.departmentId);
              const isOnLeave = onLeaveToday.some(a => a.employeeId === emp.id);
              return (
                <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <Avatar name={emp.name} size="md" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-1)', fontSize: 14 }}>{emp.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{des?.name || '—'} · {dept?.name || '—'}</div>
                  </div>
                  {isOnLeave
                    ? <span className="badge badge-pending">On Leave</span>
                    : <span className="badge badge-active">Active</span>}
                </div>
              );
            })
          )}
        </div>

        {/* On Leave Today / Recent Leaves */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 16 }}>
            {onLeaveToday.length > 0 ? 'On Leave Today' : 'Recent Leave Requests'}
          </div>
          {(onLeaveToday.length > 0 ? onLeaveToday : teamLeaves.slice(0, 6)).length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}><CalendarDays size={36} color="#cbd5e1" /><p>No leave requests yet</p></div>
          ) : (
            (onLeaveToday.length > 0 ? onLeaveToday : teamLeaves.slice(0, 6)).map(a => {
              const emp = employees.find(e => e.id === a.employeeId);
              return emp ? (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <Avatar name={emp.name} size="sm" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{emp.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{a.type} · {a.fromDate} – {a.toDate}</div>
                  </div>
                  <span className={`badge badge-${a.status === 'approved' ? 'active' : a.status === 'pending' ? 'pending' : 'inactive'}`}>{a.status}</span>
                </div>
              ) : null;
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
