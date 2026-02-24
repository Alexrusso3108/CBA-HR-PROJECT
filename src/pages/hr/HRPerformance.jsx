import { useMemo } from 'react';
import { TrendingUp, Star, Target, Users, FileText, Award } from 'lucide-react';
import Layout from '../../components/Layout';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import { getEmployees, getDepartments, getPerformanceReviews, getGoals, getLeaveApplications } from '../../store/dataStore';

function StarRow({ value, max = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: max }, (_, i) => i + 1).map(n => (
        <span key={n} style={{ fontSize: 14, color: n <= value ? '#f59e0b' : '#e2e8f0' }}>&#9733;</span>
      ))}
      <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>{value}/{max}</span>
    </div>
  );
}

export default function HRPerformance() {
  const employees = getEmployees().filter(e => e.status === 'active');
  const departments = getDepartments();
  const allReviews = getPerformanceReviews({});
  const allGoals = getGoals({});
  const allLeaves = getLeaveApplications({});

  const YEAR = new Date().getFullYear();

  const empData = useMemo(() => employees.map(e => {
    const reviews = allReviews.filter(r => r.employeeId === e.id);
    const goals = allGoals.filter(g => g.employeeId === e.id);
    const currentReview = reviews.find(r => r.year === YEAR);
    const leaves = allLeaves.filter(l => l.employeeId === e.id && l.status === 'approved').length;
    const avgGoalPct = goals.length ? Math.round(goals.reduce((a, g) => a + g.progress, 0) / goals.length) : 0;
    const dept = departments.find(d => d.id === e.departmentId);
    return { ...e, reviews, goals, currentReview, leaves, avgGoalPct, dept };
  }), [employees, allReviews, allGoals, allLeaves, departments]);

  const totalReviews = allReviews.length;
  const pendingFeedback = allReviews.filter(r => r.status === 'submitted').length;
  const reviewed = allReviews.filter(r => r.status === 'reviewed').length;
  const avgRating = allReviews.filter(r => r.managerRating).length > 0
    ? (allReviews.filter(r => r.managerRating).reduce((a, r) => a + r.managerRating, 0) / allReviews.filter(r => r.managerRating).length).toFixed(1)
    : '—';

  return (
    <Layout title="HR — Performance Overview">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Performance Overview</h1>
          <p>Organisation-wide performance reviews and goal tracking for FY {YEAR}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Reviews', value: totalReviews, icon: FileText, color: '#4f46e5', bg: '#eef2ff' },
          { label: 'Awaiting Feedback', value: pendingFeedback, icon: TrendingUp, color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Fully Reviewed', value: reviewed, icon: Award, color: '#10b981', bg: '#f0fdf4' },
          { label: 'Avg Manager Rating', value: avgRating, icon: Star, color: '#0ea5e9', bg: '#f0f9ff' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card">
              <div style={{ width: 46, height: 46, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Per Employee */}
      <div className="card">
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 16 }}>Employee Performance Matrix — FY {YEAR}</div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Review Status</th>
                <th>Self Rating</th>
                <th>Manager Rating</th>
                <th>Goal Progress</th>
                <th>Goals</th>
                <th>Leaves Taken</th>
              </tr>
            </thead>
            <tbody>
              {empData.map(e => (
                <tr key={e.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={e.name} size="sm" />
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13.5 }}>{e.name}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{e.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12.5, color: '#64748b' }}>{e.dept?.name || '—'}</td>
                  <td>
                    {e.currentReview
                      ? <Badge status={e.currentReview.status} />
                      : <span style={{ fontSize: 12, color: '#cbd5e1', fontStyle: 'italic' }}>Not submitted</span>}
                  </td>
                  <td>
                    {e.currentReview?.selfRating
                      ? <StarRow value={e.currentReview.selfRating} />
                      : <span style={{ color: '#cbd5e1', fontSize: 12 }}>—</span>}
                  </td>
                  <td>
                    {e.currentReview?.managerRating
                      ? <StarRow value={e.currentReview.managerRating} />
                      : <span style={{ color: '#cbd5e1', fontSize: 12 }}>—</span>}
                  </td>
                  <td>
                    {e.goals.length > 0 ? (
                      <div style={{ width: 120 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                          <span style={{ color: '#64748b' }}>Progress</span>
                          <span style={{ fontWeight: 700, color: '#4f46e5' }}>{e.avgGoalPct}%</span>
                        </div>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${e.avgGoalPct}%` }} /></div>
                      </div>
                    ) : <span style={{ color: '#cbd5e1', fontSize: 12 }}>—</span>}
                  </td>
                  <td style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                    {e.goals.filter(g => g.status === 'completed').length}
                    <span style={{ color: '#94a3b8', fontWeight: 400 }}>/{e.goals.length}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontWeight: 700, color: e.leaves > 5 ? '#ef4444' : '#0f172a' }}>{e.leaves}</span>
                  </td>
                </tr>
              ))}
              {empData.length === 0 && (
                <tr><td colSpan={8}><div className="empty-state" style={{ padding: 32 }}><TrendingUp size={36} color="#cbd5e1" /><p>No data available</p></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
