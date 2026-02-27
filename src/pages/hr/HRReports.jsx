import { useMemo } from 'react';
import { BarChart2, Download, Users, CalendarDays, TrendingUp, Building } from 'lucide-react';
import Layout from '../../components/Layout';
import { useCompanyData } from '../../hooks/useCompanyData';

function StatBox({ label, value, color = '#4f46e5', sub }) {
  return (
    <div style={{ padding: '20px 24px', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', flex: 1 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color, marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#94a3b8' }}>{sub}</div>}
    </div>
  );
}

export default function HRReports() {
  const { employees, departments, leaveApplications, loading } = useCompanyData();

  const active = employees.filter(e => e.status === 'active');
  const inactive = employees.filter(e => e.status === 'inactive');

  const deptStats = useMemo(() => departments.map(d => ({
    name: d.name,
    active: active.filter(e => e.departmentId === d.id).length,
    inactive: inactive.filter(e => e.departmentId === d.id).length,
    managers: active.filter(e => e.departmentId === d.id && e.role === 'manager').length,
  })).filter(d => d.active > 0 || d.inactive > 0), [active, inactive, departments]);

  const leaveByType = { CL: 0, SL: 0, PL: 0 };
  leaveApplications.filter(l => l.status === 'approved').forEach(l => { leaveByType[l.type] = (leaveByType[l.type] || 0) + 1; });

  const rolesBreakdown = ['employee', 'manager', 'hr', 'admin'].map(r => ({
    role: r, count: active.filter(e => e.role === r).length,
  })).filter(r => r.count > 0);

  const ROLE_COLORS = { employee: '#4f46e5', manager: '#10b981', hr: '#0ea5e9', admin: '#f59e0b' };

  const avgTenure = active.length
    ? Math.round(active.reduce((a, e) => a + (new Date().getFullYear() - new Date(e.joiningDate).getFullYear()), 0) / active.length)
    : 0;

  const newJoinees = active.filter(e => e.joiningDate?.startsWith(String(new Date().getFullYear()))).length;

  return (
    <Layout title="HR Reports">
      <div className="page-header">
        <div className="page-header-left">
          <h1>HR Reports</h1>
          <p>Snapshot of organisation headcount, leave utilisation, and workforce analytics</p>
        </div>
        <button className="btn btn-secondary" onClick={() => window.print()}>
          <Download size={14} /> Export Report
        </button>
      </div>

      {loading ? (
        <div className="empty-state" style={{ padding: 48 }}><p>Loading data from database…</p></div>
      ) : (
        <>
          {/* Workforce Summary */}
          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Workforce Summary</div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <StatBox label="Total Headcount" value={employees.length} sub={`${active.length} active, ${inactive.length} inactive`} />
            <StatBox label="Departments" value={departments.length} color="#10b981" sub="Functional units" />
            <StatBox label="Avg Tenure" value={`${avgTenure} yrs`} color="#0ea5e9" sub="Among active employees" />
            <StatBox label="New Joinings" value={newJoinees} color="#8b5cf6" sub={`In ${new Date().getFullYear()}`} />
          </div>

          <div className="grid-2" style={{ marginBottom: 24 }}>
            {/* Department Headcount */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Building size={15} color="#4f46e5" />
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.6 }}>Headcount by Department</div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    {['Department', 'Active', 'Managers', 'Share'].map(h => (
                      <th key={h} style={{ textAlign: h === 'Share' ? 'right' : h !== 'Department' ? 'center' : 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deptStats.map(d => {
                    const pct = active.length ? Math.round((d.active / active.length) * 100) : 0;
                    return (
                      <tr key={d.name} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '10px 0', fontSize: 13.5, fontWeight: 600, color: '#1e293b' }}>{d.name}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#4f46e5', fontSize: 16 }}>{d.active}</td>
                        <td style={{ textAlign: 'center', fontSize: 13, color: '#10b981', fontWeight: 600 }}>{d.managers}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                            <div style={{ width: 80, background: '#f1f5f9', borderRadius: 99, height: 6, position: 'relative', overflow: 'hidden' }}>
                              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: '#4f46e5', borderRadius: 99 }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', width: 30, textAlign: 'right' }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Role Distribution */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Users size={15} color="#10b981" />
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.6 }}>Role Distribution</div>
              </div>
              {rolesBreakdown.map(r => {
                const pct = active.length ? Math.round((r.count / active.length) * 100) : 0;
                const color = ROLE_COLORS[r.role];
                return (
                  <div key={r.role} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#334155', textTransform: 'capitalize' }}>{r.role}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color }}>{r.count} <span style={{ color: '#94a3b8', fontWeight: 400 }}>({pct}%)</span></span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: 99, height: 8, position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leave Analytics */}
          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Leave Analytics</div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <StatBox label="Total Applications" value={leaveApplications.length} sub="All time" />
            <StatBox label="Approved Leaves" value={leaveApplications.filter(l => l.status === 'approved').length} color="#10b981" sub="Casual + Sick + Paid" />
            <StatBox label="Casual Leaves Used" value={leaveByType.CL} color="#4f46e5" sub="CL across all employees" />
            <StatBox label="Sick Leaves Used" value={leaveByType.SL} color="#0ea5e9" sub="SL across all employees" />
            <StatBox label="Paid Leaves Used" value={leaveByType.PL} color="#f59e0b" sub="PL across all employees" />
          </div>
        </>
      )}
    </Layout>
  );
}
