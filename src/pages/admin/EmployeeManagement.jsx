import { useState } from 'react';
import {
  Plus, Edit2, UserX, UserCheck, Search,
  AlertCircle, Copy, CheckCircle2, KeyRound, X
} from 'lucide-react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import Avatar from '../../components/Avatar';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  getEmployees, addEmployee, updateEmployee,
  deactivateEmployee, reactivateEmployee,
  getDepartments, getDesignations,
} from '../../store/dataStore';

// ALL supported roles — admin can assign any of these
const ROLES = [
  { value: 'employee', label: 'Employee', color: '#818cf8' },
  { value: 'intern', label: 'Intern', color: '#94a3b8' },
  { value: 'hr', label: 'HR', color: '#c084fc' },
  { value: 'manager', label: 'Manager', color: '#38bdf8' },
  { value: 'admin', label: 'Admin', color: '#34d399' },
];

const emptyForm = {
  name: '', email: '', phone: '', address: '', dob: '',
  joiningDate: new Date().toISOString().split('T')[0],
  departmentId: '', designationId: '', managerId: '',
  role: 'employee', salary: '', emergencyContact: '',
  password: 'Welcome@123',
};

export default function EmployeeManagement() {
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [tab, setTab] = useState('active');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [alert, setAlert] = useState(null);
  const [refresh, setRefresh] = useState(0);
  // Credential card shown after successful add
  const [newCreds, setNewCreds] = useState(null);
  const [copiedField, setCopiedField] = useState('');

  const { user: adminUser } = useAuth();
  const departments = getDepartments();
  const designations = getDesignations();
  const allEmployees = getEmployees();
  const managers = allEmployees.filter(e => ['manager', 'admin', 'hr'].includes(e.role));

  function showAlert(type, msg) {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3500);
  }

  function copyToClipboard(text, field) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 1500);
    });
  }

  const filtered = allEmployees.filter(e => {
    const matchStatus = tab === 'active' ? e.status === 'active' : e.status === 'inactive';
    const matchSearch = !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = !filterDept || e.departmentId === filterDept;
    const matchRole = !filterRole || e.role === filterRole;
    return matchStatus && matchSearch && matchDept && matchRole;
  });

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  }

  function openEdit(emp) {
    setEditing(emp);
    setForm({
      name: emp.name, email: emp.email, phone: emp.phone || '',
      address: emp.address || '', dob: emp.dob || '',
      joiningDate: emp.joiningDate || '',
      departmentId: emp.departmentId || '',
      designationId: emp.designationId || '',
      managerId: emp.managerId || '',
      role: emp.role, salary: emp.salary || '',
      emergencyContact: emp.emergencyContact || '',
      password: emp.password || '',
    });
    setFormError('');
    setShowModal(true);
  }

  async function handleSave() {
    setFormError('');
    if (!form.name.trim()) return setFormError('Full name is required.');
    if (!form.email.trim()) return setFormError('Work email is required.');
    if (!form.joiningDate) return setFormError('Joining date is required.');
    if (!form.role) return setFormError('Please select a role.');
    if (!form.password.trim()) return setFormError('A temporary password is required.');

    if (editing) {
      // Local update for now
      updateEmployee(editing.id, {
        ...form,
        salary: Number(form.salary) || 0,
        managerId: form.managerId || null,
      });
      showAlert('success', `${form.name} updated successfully!`);
      setShowModal(false);
      setRefresh(r => r + 1);
      return;
    }

    // ── Add via Supabase RPC ────────────────────────────────────────
    // Helper: only pass UUIDs to Supabase — local store IDs like 'dept-1' are invalid
    const isUUID = v => v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

    // Supabase CHECK only allows: admin|manager|hr|employee
    // 'intern' is a display-only role — stored as 'employee' in DB
    const dbRole = form.role === 'intern' ? 'employee' : form.role;

    try {
      const { data, error } = await supabase.rpc('add_employee', {
        p_company_id: adminUser?.company_id,
        p_name: form.name.trim(),
        p_email: form.email.trim(),
        p_plain_password: form.password,
        p_role: dbRole,
        p_phone: form.phone || null,
        p_dob: form.dob || null,
        p_joining_date: form.joiningDate,
        p_salary: Number(form.salary) || 0,
        p_department_id: isUUID(form.departmentId) ? form.departmentId : null,
        p_designation_id: isUUID(form.designationId) ? form.designationId : null,
        p_manager_id: isUUID(form.managerId) ? form.managerId : null,
        p_address: form.address || null,
        p_emergency_contact: form.emergencyContact || null,
      });

      if (error) throw error;

      const created = data?.[0];
      setNewCreds({
        name: created?.name || form.name,
        id: created?.employee_code || '—',
        email: created?.email || form.email,
        role: created?.role || form.role,
        password: form.password,
      });
      showAlert('success', `${form.name} added! Share the credentials below.`);
      setShowModal(false);
      setRefresh(r => r + 1);
    } catch (err) {
      console.error('add_employee error:', err);
      setFormError(err?.message || 'Failed to add employee. Please try again.');
    }
  }

  function handleToggleStatus(emp) {
    if (emp.status === 'active') {
      if (!window.confirm(`Deactivate ${emp.name}? They will lose access.`)) return;
      deactivateEmployee(emp.id);
      showAlert('info', `${emp.name} has been deactivated.`);
    } else {
      reactivateEmployee(emp.id);
      showAlert('success', `${emp.name} has been reactivated.`);
    }
    setRefresh(r => r + 1);
  }

  const deptName = id => departments.find(d => d.id === id)?.name || '—';
  const desName = id => designations.find(d => d.id === id)?.name || '—';
  const mgrName = id => allEmployees.find(e => e.id === id)?.name || '—';
  const roleInfo = v => ROLES.find(r => r.value === v) || { color: '#94a3b8', label: v };

  return (
    <Layout title="Employee Management">
      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Employee Management</h1>
          <p>Add team members and manage their access credentials</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={15} /> Add Employee
        </button>
      </div>

      {/* ── Credentials Card (shows after adding a new employee) ── */}
      {newCreds && (
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          border: '1px solid rgba(129,140,248,0.35)',
          borderRadius: 14, padding: '20px 24px',
          marginBottom: 24, position: 'relative',
          boxShadow: '0 8px 32px rgba(79,70,229,0.18)',
        }}>
          {/* Close */}
          <button onClick={() => setNewCreds(null)} style={{
            position: 'absolute', top: 14, right: 16,
            background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
            display: 'flex', padding: 4,
          }}>
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <KeyRound size={18} color="#818cf8" />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
              New Employee Credentials — Share with {newCreds.name}
            </span>
            <span style={{
              background: roleInfo(newCreds.role).color + '22',
              color: roleInfo(newCreds.role).color,
              border: `1px solid ${roleInfo(newCreds.role).color}55`,
              padding: '2px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 700, textTransform: 'capitalize',
            }}>
              {newCreds.role}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[
              { label: 'Employee ID', value: newCreds.id, field: 'id' },
              { label: 'Login Email', value: newCreds.email, field: 'email' },
              { label: 'Temp Password', value: newCreds.password, field: 'pass' },
            ].map(({ label, value, field }) => (
              <div key={field} style={{
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 10, padding: '12px 14px',
                border: '1px solid rgba(255,255,255,0.10)',
              }}>
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
                  {label}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <code style={{ color: '#e2e8f0', fontSize: 13.5, fontWeight: 700, fontFamily: 'monospace' }}>
                    {value}
                  </code>
                  <button onClick={() => copyToClipboard(value, field)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: copiedField === field ? '#34d399' : 'rgba(255,255,255,0.4)',
                    display: 'flex', padding: 2, transition: 'color 0.2s',
                  }}>
                    {copiedField === field ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>
            ⚠️ Ask the employee to change their password after first login. This panel disappears once you close it.
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Employees', val: allEmployees.length, color: '#6c63ff' },
          { label: 'Active', val: allEmployees.filter(e => e.status === 'active').length, color: '#38ef7d' },
          { label: 'Managers', val: allEmployees.filter(e => e.role === 'manager').length, color: '#38bdf8' },
          { label: 'HR Staff', val: allEmployees.filter(e => e.role === 'hr').length, color: '#c084fc' },
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
          <select className="form-select" style={{ width: 150 }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          {(search || filterDept || filterRole) && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterDept(''); setFilterRole(''); }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>
          Active ({allEmployees.filter(e => e.status === 'active').length})
        </button>
        <button className={`tab-btn ${tab === 'inactive' ? 'active' : ''}`} onClick={() => setTab('inactive')}>
          Inactive ({allEmployees.filter(e => e.status === 'inactive').length})
        </button>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Role</th>
                <th>Manager</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9}><div className="empty-state" style={{ padding: 32 }}><Search size={36} color="#cbd5e1" /><p>No employees found</p></div></td></tr>
              ) : (
                filtered.map(emp => {
                  const ri = roleInfo(emp.role);
                  return (
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
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-light)', fontSize: 12.5 }}>{emp.id}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-2)' }}>{deptName(emp.departmentId)}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-2)' }}>{desName(emp.designationId)}</td>
                      <td>
                        <span style={{
                          padding: '3px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 700,
                          background: ri.color + '18', color: ri.color,
                          border: `1px solid ${ri.color}40`, textTransform: 'capitalize',
                        }}>
                          {ri.label}
                        </span>
                      </td>
                      <td style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{emp.managerId ? mgrName(emp.managerId) : '—'}</td>
                      <td style={{ fontSize: 12.5 }}>{emp.joiningDate || '—'}</td>
                      <td><Badge status={emp.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(emp)} title="Edit">
                            <Edit2 size={12} />
                          </button>
                          <button
                            className={`btn btn-sm ${emp.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                            onClick={() => handleToggleStatus(emp)}
                            title={emp.status === 'active' ? 'Deactivate' : 'Reactivate'}
                          >
                            {emp.status === 'active' ? <UserX size={12} /> : <UserCheck size={12} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add / Edit Modal ──────────────────────────────────── */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? `Edit: ${editing.name}` : 'Add New Employee'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>
              {editing ? 'Save Changes' : 'Add Employee'}
            </button>
          </>
        }
      >
        {formError && (
          <div className="alert alert-error" style={{ marginBottom: 14 }}>
            <AlertCircle size={14} /> {formError}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

          {/* Basic fields */}
          {[
            { label: 'Full Name *', key: 'name', placeholder: 'e.g. John Doe' },
            { label: 'Work Email *', key: 'email', placeholder: 'e.g. john@company.com' },
            { label: 'Phone', key: 'phone', placeholder: '9876543210' },
            { label: 'Emergency Contact', key: 'emergencyContact', placeholder: 'Emergency number' },
            { label: 'Date of Birth', key: 'dob', type: 'date' },
            { label: 'Joining Date *', key: 'joiningDate', type: 'date' },
            { label: 'Salary (₹)', key: 'salary', type: 'number', placeholder: '50000' },
          ].map(f => (
            <div key={f.key} className="form-group">
              <label className="form-label">{f.label}</label>
              <input
                className="form-input"
                type={f.type || 'text'}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              />
            </div>
          ))}

          {/* Role */}
          <div className="form-group">
            <label className="form-label">Role *</label>
            <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div className="form-group">
            <label className="form-label">Department</label>
            <select className="form-select" value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value, designationId: '' })}>
              <option value="">Select Department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          {/* Designation */}
          <div className="form-group">
            <label className="form-label">Designation</label>
            <select className="form-select" value={form.designationId} onChange={e => setForm({ ...form, designationId: e.target.value })}>
              <option value="">Select Designation</option>
              {designations.filter(d => !form.departmentId || d.deptId === form.departmentId).map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Manager */}
          <div className="form-group">
            <label className="form-label">Reporting Manager</label>
            <select className="form-select" value={form.managerId} onChange={e => setForm({ ...form, managerId: e.target.value })}>
              <option value="">None (Top Level)</option>
              {managers.filter(m => !editing || m.id !== editing.id).map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
              ))}
            </select>
          </div>

          {/* Temp Password */}
          <div className="form-group">
            <label className="form-label">Temporary Password *</label>
            <input
              className="form-input"
              type="text"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="e.g. Welcome@123"
            />
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
              Employee must change this after first login
            </div>
          </div>

          {/* Address full width */}
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Address</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="Full address"
            />
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
