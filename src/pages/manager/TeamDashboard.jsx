import { Users, TrendingUp, CalendarDays, Target } from 'lucide-react';
import Layout from '../../components/Layout';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';
import { getTeamMembers, getLeaveApplications, getGoals, getDepartments, getDesignations } from '../../store/dataStore';

export default function TeamDashboard() {
  const { user } = useAuth();
  const team = getTeamMembers(user.id);
  const teamIds = team.map(e => e.id);
  const teamLeaves = getLeaveApplications({ teamIds });
  const teamGoals = getGoals({ teamIds });
  const departments = getDepartments();
  const designations = getDesignations();

  const onLeaveToday = teamLeaves.filter(a => {
    if (a.status !== 'approved') return false;
    const now = new Date().toISOString().split('T')[0];
    return a.fromDate <= now && a.toDate >= now;
  });

  const goalProgress = teamIds.length > 0 ? Math.round(teamGoals.reduce((acc, g) => acc + g.progress, 0) / (teamGoals.length || 1)) : 0;

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
          { label: 'Team Size', value: team.length, icon: Users, color: '#6c63ff', sub: 'Direct reports' },
          { label: 'On Leave Today', value: onLeaveToday.length, icon: CalendarDays, color: '#fc5c7d', sub: 'Approved' },
          { label: 'Total Goals', value: teamGoals.length, icon: Target, color: '#38ef7d', sub: `${teamGoals.filter(g => g.status === 'completed').length} completed` },
          { label: 'Avg Goal Progress', value: `${goalProgress}%`, icon: TrendingUp, color: '#f6ad55', sub: 'Across all goals' },
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
          {team.length === 0 ? (
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
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{des?.name} · {dept?.name}</div>
                  </div>
                  {isOnLeave ? (
                    <span className="badge badge-pending">On Leave</span>
                  ) : (
                    <span className="badge badge-active">Active</span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Team Goals Summary */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 16 }}>Team Goals Progress</div>
          {teamGoals.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}><Target size={36} color="#cbd5e1" /><p>No goals set yet</p></div>
          ) : (
            team.map(emp => {
              const empGoals = teamGoals.filter(g => g.employeeId === emp.id);
              if (empGoals.length === 0) return null;
              const avgPct = Math.round(empGoals.reduce((a, g) => a + g.progress, 0) / empGoals.length);
              return (
                <div key={emp.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar name={emp.name} size="sm" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{emp.name}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{empGoals.filter(g => g.status === 'completed').length}/{empGoals.length} done · {avgPct}%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${avgPct}%` }} /></div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* On Leave Today */}
      {onLeaveToday.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 16 }}>
            Team On Leave Today
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {onLeaveToday.map(a => {
              const emp = team.find(e => e.id === a.employeeId);
              return emp ? (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'var(--bg-surface)', borderRadius: 10 }}>
                  <Avatar name={emp.name} size="sm" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{emp.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{a.type} · till {a.toDate}</div>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </Layout>
  );
}
