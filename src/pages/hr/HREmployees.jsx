import { useState, useMemo } from 'react';
import { Search, Users, Building } from 'lucide-react';
import Layout from '../../components/Layout';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import { getEmployees, getDepartments, getDesignations, getLeaveBalance } from '../../store/dataStore';

const ROLES = ['employee', 'manager', 'hr', 'admin'];

export default function HREmployees() {
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [tab, setTab] = useState('active');
  const [selected, setSelected] = useState(null);

  const employees = getEmployees();
  const departments = getDepartments();
  const designations = getDesignations();

  const deptName = id => departments.find(d => d.id === id)?.name || '—';
  const desName = id => designations.find(d => d.id === id)?.name || '—';
  const mgrName = id => employees.find(e => e.id === id)?.name || '—';

  const filtered = useMemo(() => employees.filter(e => {
    const matchStatus = tab === 'active' ? e.status === 'active' : e.status === 'inactive';
    const s = search.toLowerCase();
    const matchSearch = !search || e.name.toLowerCase().includes(s) || e.id.toLowerCase().includes(s) || e.email.toLowerCase().includes(s);
    const matchDept = !filterDept || e.departmentId === filterDept;
    const matchRole = !filterRole || e.role === filterRole;
    return matchStatus && matchSearch && matchDept && matchRole;
  }), [employees, tab, search, filterDept, filterRole]);

  const activeCount = employees.filter(e => e.status === 'active').length;
  const inactiveCount = employees.filter(e => e.status === 'inactive').length;

  return (
    <Layout title="HR — All Employees">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Employee Records</h1>
          <p>{activeCount} active &nbsp;·&nbsp; {inactiveCount} inactive &nbsp;·&nbsp; {employees.length} total</p>
        </div>
      </div>

      {/* Dept Breakdown cards */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {departments.map(d => {
          const count = employees.filter(e => e.departmentId === d.id && e.status === 'active').length;
          if (!count) return null;
          return (
            <button key={d.id} onClick={() => setFilterDept(filterDept === d.id ? '' : d.id)}
              style={{ padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${filterDept === d.id ? '#4f46e5' : '#e2e8f0'}`, background: filterDept === d.id ? '#eef2ff' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s' }}>
              <Building size={13} color={filterDept === d.id ? '#4f46e5' : '#64748b'} />
              <span style={{ fontSize: 12.5, fontWeight: 600, color: filterDept === d.id ? '#4f46e5' : '#334155' }}>{d.name}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: filterDept === d.id ? '#4f46e5' : '#94a3b8', background: filterDept === d.id ? '#c7d2fe' : '#f1f5f9', padding: '1px 7px', borderRadius: 99 }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar">
          <Search size={15} className="search-icon" />
          <input placeholder="Search by name, ID, or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260 }} />
        </div>
        <select className="form-select" style={{ width: 160 }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
        {(search || filterDept || filterRole) && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterDept(''); setFilterRole(''); }}>Clear Filters</button>
        )}
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>Active ({activeCount})</button>
        <button className={`tab-btn ${tab === 'inactive' ? 'active' : ''}`} onClick={() => setTab('inactive')}>Inactive ({inactiveCount})</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Employee</th><th>ID</th><th>Department</th><th>Designation</th><th>Role</th><th>Reporting To</th><th>Joining Date</th><th>Leave Balance</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9}><div className="empty-state" style={{ padding: 32 }}><Users size={36} color="#cbd5e1" /><p>No employees found</p></div></td></tr>
              ) : (
                filtered.map(e => {
                  const bal = getLeaveBalance(e.id);
                  return (
                    <tr key={e.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(selected?.id === e.id ? null : e)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={e.name} size="sm" />
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13.5 }}>{e.name}</div>
                            <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{e.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#4f46e5', fontSize: 12.5 }}>{e.id}</td>
                      <td style={{ fontSize: 13, color: '#334155' }}>{deptName(e.departmentId)}</td>
                      <td style={{ fontSize: 13, color: '#334155' }}>{desName(e.designationId)}</td>
                      <td>
                        <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'capitalize', background: e.role === 'admin' ? '#fef3c7' : e.role === 'hr' ? '#e0e7ff' : e.role === 'manager' ? '#f0fdf4' : '#f8fafc', color: e.role === 'admin' ? '#d97706' : e.role === 'hr' ? '#4f46e5' : e.role === 'manager' ? '#10b981' : '#64748b', padding: '3px 9px', borderRadius: 6, border: '1px solid', borderColor: e.role === 'admin' ? '#fde68a' : e.role === 'hr' ? '#c7d2fe' : e.role === 'manager' ? '#bbf7d0' : '#e2e8f0' }}>
                          {e.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: 12.5, color: '#64748b' }}>{e.managerId ? mgrName(e.managerId) : <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12.5 }}>{e.joiningDate}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {['CL', 'SL', 'PL'].map(t => (
                            <span key={t} style={{ fontSize: 11, background: '#f1f5f9', padding: '2px 7px', borderRadius: 5, fontWeight: 700 }}>
                              {t}: <span style={{ color: '#4f46e5' }}>{bal[t]}</span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td><Badge status={e.status} /></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
