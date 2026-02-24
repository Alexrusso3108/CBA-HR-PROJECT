import { useState } from 'react';
import { Search, Mail, Phone, Building, MapPin, User, Calendar, X } from 'lucide-react';
import Layout from '../components/Layout';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import { getEmployees, getDepartments, getDesignations } from '../store/dataStore';

export default function Directory() {
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [selectedEmp, setSelectedEmp] = useState(null);

  const employees = getEmployees().filter(e => e.status === 'active');
  const departments = getDepartments();
  const designations = getDesignations();

  const filtered = employees.filter(e => {
    const s = search.toLowerCase();
    const matchSearch = !search || e.name.toLowerCase().includes(s) || e.id.toLowerCase().includes(s) || e.email.toLowerCase().includes(s) || e.phone?.includes(s);
    const matchDept = !filterDept || e.departmentId === filterDept;
    return matchSearch && matchDept;
  });

  function deptName(id) { return departments.find(d => d.id === id)?.name || '—'; }
  function desName(id) { return designations.find(d => d.id === id)?.name || '—'; }
  function managerName(id) { return employees.find(e => e.id === id)?.name || 'None'; }

  return (
    <Layout title="Employee Directory">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Employee Directory</h1>
          <p>{employees.length} active employees across {departments.length} departments</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-bar">
          <Search size={15} className="search-icon" />
          <input style={{ width: 260 }} placeholder="Search by name, ID, email, phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 180 }} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        {(search || filterDept) && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterDept(''); }}>Clear</button>
        )}
      </div>

      {/* Department Groups */}
      {!search && !filterDept ? (
        departments.map(dept => {
          const deptEmps = employees.filter(e => e.departmentId === dept.id);
          if (deptEmps.length === 0) return null;
          return (
            <div key={dept.id} className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)' }} />
                <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>{dept.name}</span>
                <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 4 }}>{deptEmps.length} members</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {deptEmps.map(emp => (
                  <EmpCard key={emp.id} emp={emp} desName={desName} onClick={() => setSelectedEmp(emp)} />
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.length === 0 ? (
            <div className="empty-state card" style={{ gridColumn: '1/-1' }}><User size={40} color="#cbd5e1" /><p>No employees found</p></div>
          ) : (
            filtered.map(emp => <EmpCard key={emp.id} emp={emp} desName={desName} onClick={() => setSelectedEmp(emp)} />)
          )}
        </div>
      )}

      {/* Detail Panel */}
      {selectedEmp && (
        <div className="modal-overlay" onClick={() => setSelectedEmp(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Avatar name={selectedEmp.name} size="md" />
                <div>
                  <h2 style={{ fontSize: 16 }}>{selectedEmp.name}</h2>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 400 }}>{selectedEmp.id}</div>
                </div>
              </div>
              <button className="icon-btn" onClick={() => setSelectedEmp(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              {[
                { icon: Building, label: 'Department', val: deptName(selectedEmp.departmentId) },
                { icon: User, label: 'Designation', val: desName(selectedEmp.designationId) },
                { icon: Mail, label: 'Email', val: selectedEmp.email },
                { icon: Phone, label: 'Phone', val: selectedEmp.phone },
                { icon: MapPin, label: 'Address', val: selectedEmp.address },
                { icon: Calendar, label: 'Date of Birth', val: selectedEmp.dob },
                { icon: Calendar, label: 'Joining Date', val: selectedEmp.joiningDate },
                { icon: User, label: 'Manager', val: managerName(selectedEmp.managerId) },
              ].map(r => {
                const Icon = r.icon;
                return (
                  <div key={r.label} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={13} color="#64748b" />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>{r.label}</div>
                      <div style={{ fontSize: 13.5, color: 'var(--text-1)' }}>{r.val}</div>
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: 12 }}>
                <Badge status={selectedEmp.role} label={selectedEmp.role.charAt(0).toUpperCase() + selectedEmp.role.slice(1)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function EmpCard({ emp, desName, onClick }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '14px', background: 'var(--bg-surface)', borderRadius: 10, cursor: 'pointer', transition: 'var(--transition)', border: '1px solid transparent' }}
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'var(--bg-surface)'; }}>
      <Avatar name={emp.name} size="md" />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-1)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{desName(emp.designationId)}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Mail size={11} />{emp.email}
        </div>
      </div>
    </div>
  );
}
