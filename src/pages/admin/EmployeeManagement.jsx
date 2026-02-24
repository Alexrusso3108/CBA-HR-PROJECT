import { useState } from 'react';
import { Plus, Edit2, Power, Search, AlertCircle, UserCheck, UserX } from 'lucide-react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import Avatar from '../../components/Avatar';
import { getEmployees, addEmployee, updateEmployee, deactivateEmployee, reactivateEmployee, getDepartments, getDesignations } from '../../store/dataStore';

const ROLES = ['employee', 'manager', 'admin'];

const emptyForm = {
  name: '', email: '', phone: '', address: '', dob: '', joiningDate: '',
  departmentId: '', designationId: '', managerId: '', role: 'employee', salary: '', emergencyContact: '', password: 'password123',
};

export default function EmployeeManagement() {
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [alert, setAlert] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [tab, setTab] = useState('active');

  const departments = getDepartments();
  const designations = getDesignations();
  const allEmployees = getEmployees();
  const managers = allEmployees.filter(e => e.role === 'manager' || e.role === 'admin');

  function showAlert(type, msg) { setAlert({ type, msg }); setTimeout(() => setAlert(null), 3500); }

  const filtered = allEmployees.filter(e => {
    const matchStatus = tab === 'active' ? e.status === 'active' : e.status === 'inactive';
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = !filterDept || e.departmentId === filterDept;
    const matchRole = !filterRole || e.role === filterRole;
    return matchStatus && matchSearch && matchDept && matchRole;
  });

  function openAdd() { setEditing(null); setForm(emptyForm); setFormError(''); setShowModal(true); }
  function openEdit(emp) {
    setEditing(emp);
    setForm({ name: emp.name, email: emp.email, phone: emp.phone, address: emp.address, dob: emp.dob, joiningDate: emp.joiningDate, departmentId: emp.departmentId, designationId: emp.designationId, managerId: emp.managerId || '', role: emp.role, salary: emp.salary, emergencyContact: emp.emergencyContact, password: emp.password });
    setFormError('');
    setShowModal(true);
  }

  function handleSave() {
    setFormError('');
    if (!form.name.trim()) { setFormError('Name is required.'); return; }
    if (!form.email.trim()) { setFormError('Email is required.'); return; }
    if (!form.departmentId) { setFormError('Please select a department.'); return; }
    if (!form.designationId) { setFormError('Please select a designation.'); return; }
    if (!form.joiningDate) { setFormError('Joining date is required.'); return; }

    const data = { ...form, salary: Number(form.salary) || 0, managerId: form.managerId || null };
    if (editing) {
      updateEmployee(editing.id, data);
      showAlert('success', 'Employee updated successfully!');
    } else {
      addEmployee(data);
      showAlert('success', 'Employee added successfully!');
    }
    setShowModal(false);
    setRefresh(r => r + 1);
  }

  function handleToggleStatus(emp) {
    if (emp.status === 'active') {
      if (!window.confirm(`Deactivate ${emp.name}?`)) return;
      deactivateEmployee(emp.id);
      showAlert('info', `${emp.name} deactivated.`);
    } else {
      reactivateEmployee(emp.id);
      showAlert('success', `${emp.name} reactivated.`);
    }
    setRefresh(r => r + 1);
  }

  const deptName = id => departments.find(d => d.id === id)?.name || '—';
  const desName = id => designations.find(d => d.id === id)?.name || '—';
  const mgrName = id => allEmployees.find(e => e.id === id)?.name || '—';

  return (
    <Layout title="Employee Management">
      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Employee Management</h1>
          <p>Add, update and manage all employee records</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Employee</button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Employees', val: allEmployees.length, color: '#6c63ff' },
          { label: 'Active', val: allEmployees.filter(e => e.status === 'active').length, color: '#38ef7d' },
          { label: 'Departments', val: departments.length, color: '#38b2ac' },
          { label: 'Managers', val: allEmployees.filter(e => e.role === 'manager').length, color: '#f6ad55' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: s.color, marginRight: 4, flexShrink: 0 }} />
            <div><div className="stat-label">{s.label}</div><div className="stat-value">{s.val}</div></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar">
            <Search size={15} className="search-icon" />
            <input placeholder="Search by name, ID, email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 180 }} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select className="form-select" style={{ width: 140 }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
          {(search || filterDept || filterRole) && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterDept(''); setFilterRole(''); }}>Clear</button>
          )}
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>Active ({allEmployees.filter(e => e.status === 'active').length})</button>
        <button className={`tab-btn ${tab === 'inactive' ? 'active' : ''}`} onClick={() => setTab('inactive')}>Inactive ({allEmployees.filter(e => e.status === 'inactive').length})</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Employee</th><th>ID</th><th>Department</th><th>Designation</th><th>Role</th><th>Manager</th><th>Joining Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9}><div className="empty-state" style={{ padding: 32 }}><Search size={36} color="#cbd5e1" /><p>No employees found</p></div></td></tr>
              ) : (
                filtered.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={emp.name} size="sm" />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-1)', fontSize: 13.5 }}>{emp.name}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent-light)' }}>{emp.id}</td>
                    <td>{deptName(emp.departmentId)}</td>
                    <td>{desName(emp.designationId)}</td>
                    <td><span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{emp.role}</span></td>
                    <td style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{emp.managerId ? mgrName(emp.managerId) : '—'}</td>
                    <td style={{ fontSize: 12.5 }}>{emp.joiningDate}</td>
                    <td><Badge status={emp.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(emp)}><Edit2 size={12} /></button>
                        <button className={`btn btn-sm ${emp.status === 'active' ? 'btn-danger' : 'btn-success'}`} onClick={() => handleToggleStatus(emp)}>
                          {emp.status === 'active' ? <UserX size={12} /> : <UserCheck size={12} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? `Edit: ${editing.name}` : 'Add New Employee'} size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Save Changes' : 'Add Employee'}</button>
          </>
        }
      >
        {formError && <div className="alert alert-error"><AlertCircle size={14} /> {formError}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { label: 'Full Name', key: 'name', placeholder: 'John Doe' },
            { label: 'Email', key: 'email', placeholder: 'john@company.com' },
            { label: 'Phone', key: 'phone', placeholder: '9876543210' },
            { label: 'Emergency Contact', key: 'emergencyContact', placeholder: 'Contact number' },
            { label: 'Date of Birth', key: 'dob', type: 'date' },
            { label: 'Joining Date', key: 'joiningDate', type: 'date' },
            { label: 'Salary (₹)', key: 'salary', type: 'number', placeholder: '50000' },
            { label: 'Default Password', key: 'password', placeholder: 'password123' },
          ].map(f => (
            <div key={f.key} className="form-group">
              <label className="form-label">{f.label}</label>
              <input className="form-input" type={f.type || 'text'} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
            </div>
          ))}

          <div className="form-group">
            <label className="form-label">Department</label>
            <select className="form-select" value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value, designationId: '' })}>
              <option value="">Select Department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Designation</label>
            <select className="form-select" value={form.designationId} onChange={e => setForm({ ...form, designationId: e.target.value })}>
              <option value="">Select Designation</option>
              {designations.filter(d => !form.departmentId || d.deptId === form.departmentId).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Reporting Manager</label>
            <select className="form-select" value={form.managerId} onChange={e => setForm({ ...form, managerId: e.target.value })}>
              <option value="">None (Top Level)</option>
              {managers.filter(m => !editing || m.id !== editing.id).map(m => <option key={m.id} value={m.id}>{m.name} ({m.id})</option>)}
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Address</label>
            <textarea className="form-textarea" rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Full address" />
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
