import { useState } from 'react';
import { Check, X, CalendarDays, Search } from 'lucide-react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import Avatar from '../../components/Avatar';
import { useAuth } from '../../context/AuthContext';
import { getEmployees, getLeaveApplications, getLeaveBalance, reviewLeave, getDepartments } from '../../store/dataStore';

const LEAVE_LABELS = { CL: 'Casual Leave', SL: 'Sick Leave', PL: 'Paid Leave' };
const LEAVE_COLORS = { CL: '#4f46e5', SL: '#0ea5e9', PL: '#f59e0b' };

function daysBetween(from, to) {
  return Math.max(1, Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1);
}

export default function HRLeaveOversight() {
  const { refreshNotifications } = useAuth();
  const [tab, setTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalAction, setModalAction] = useState('');
  const [comment, setComment] = useState('');
  const [alert, setAlert] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const employees = getEmployees();
  const departments = getDepartments();
  const allLeaves = getLeaveApplications({});

  function showAlert(type, msg) { setAlert({ type, msg }); setTimeout(() => setAlert(null), 3500); }

  const pending = allLeaves.filter(l => l.status === 'pending');
  const approved = allLeaves.filter(l => l.status === 'approved');
  const rejected = allLeaves.filter(l => l.status === 'rejected');

  const displayedBase = tab === 'pending' ? pending : tab === 'approved' ? approved : tab === 'rejected' ? rejected : allLeaves;

  const displayed = displayedBase.filter(l => {
    const emp = employees.find(e => e.id === l.employeeId);
    const matchSearch = !search || emp?.name.toLowerCase().includes(search.toLowerCase()) || l.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchDept = !filterDept || emp?.departmentId === filterDept;
    return matchSearch && matchDept;
  });

  function openReview(app, action) {
    setSelectedApp(app);
    setModalAction(action);
    setComment('');
  }

  function handleReview() {
    reviewLeave(selectedApp.id, modalAction, comment);
    refreshNotifications();
    setSelectedApp(null);
    setRefresh(r => r + 1);
    showAlert(modalAction === 'approved' ? 'success' : 'info', `Leave ${modalAction} successfully.`);
  }

  function getEmpInfo(id) {
    const emp = employees.find(e => e.id === id);
    const dept = departments.find(d => d.id === emp?.departmentId);
    return { name: emp?.name || id, dept: dept?.name || '—', emp };
  }

  return (
    <Layout title="HR — Leave Oversight">
      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Leave Oversight</h1>
          <p>View and act on all leave requests across the organisation</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Applications', val: allLeaves.length, color: '#4f46e5', bg: '#eef2ff' },
          { label: 'Pending Approval', val: pending.length, color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Approved', val: approved.length, color: '#10b981', bg: '#f0fdf4' },
          { label: 'Rejected', val: rejected.length, color: '#ef4444', bg: '#fff5f5' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar">
          <Search size={15} className="search-icon" />
          <input placeholder="Search by employee name or ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260 }} />
        </div>
        <select className="form-select" style={{ width: 200 }} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        {(search || filterDept) && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterDept(''); }}>Clear</button>
        )}
      </div>

      <div className="tabs">
        {[['pending', 'Pending', pending.length], ['approved', 'Approved', null], ['rejected', 'Rejected', null], ['all', 'All Requests', null]].map(([v, l, count]) => (
          <button key={v} className={`tab-btn ${tab === v ? 'active' : ''}`} onClick={() => setTab(v)}>
            {l}
            {count > 0 && <span className="nav-badge" style={{ position: 'static', marginLeft: 6 }}>{count}</span>}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Leave Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Applied On</th>
                {tab === 'pending' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr><td colSpan={10}><div className="empty-state" style={{ padding: 32 }}><CalendarDays size={36} color="#cbd5e1" /><p>No leave applications found</p></div></td></tr>
              ) : (
                displayed.map(l => {
                  const { name, dept, emp } = getEmpInfo(l.employeeId);
                  const bal = getLeaveBalance(l.employeeId);
                  return (
                    <tr key={l.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <Avatar name={name} size="sm" />
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>{name}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{l.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: '#64748b', fontSize: 12.5 }}>{dept}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: LEAVE_COLORS[l.type], fontSize: 13 }}>{LEAVE_LABELS[l.type]}</span>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>Balance: {bal[l.type]} days</div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{l.fromDate}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{l.toDate}</td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{daysBetween(l.fromDate, l.toDate)}</td>
                      <td style={{ maxWidth: 180 }}><span className="truncate" style={{ display: 'block', fontSize: 12.5, color: '#64748b' }}>{l.reason}</span></td>
                      <td><Badge status={l.status} /></td>
                      <td style={{ fontSize: 12, color: '#94a3b8' }}>{l.appliedOn}</td>
                      {tab === 'pending' && (
                        <td>
                          {l.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-success btn-sm" onClick={() => openReview(l, 'approved')}><Check size={13} /> Approve</button>
                              <button className="btn btn-danger btn-sm" onClick={() => openReview(l, 'rejected')}><X size={13} /> Reject</button>
                            </div>
                          ) : <span style={{ color: '#cbd5e1', fontSize: 12 }}>—</span>}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)}
        title={`${modalAction === 'approved' ? 'Approve' : 'Reject'} Leave Request`} size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setSelectedApp(null)}>Cancel</button>
            <button className={`btn ${modalAction === 'approved' ? 'btn-success' : 'btn-danger'}`} onClick={handleReview}>
              {modalAction === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
            </button>
          </>
        }
      >
        {selectedApp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8, fontSize: 13.5, color: '#0f172a', border: '1px solid #e2e8f0' }}>
              <strong>{getEmpInfo(selectedApp.employeeId).name}</strong> &ndash; {LEAVE_LABELS[selectedApp.type]}<br />
              <span style={{ color: '#64748b', fontSize: 12 }}>{selectedApp.fromDate} to {selectedApp.toDate} &nbsp;({daysBetween(selectedApp.fromDate, selectedApp.toDate)} days)</span>
              <br /><span style={{ color: '#64748b', fontSize: 12 }}>Reason: {selectedApp.reason}</span>
            </div>
            <div className="form-group">
              <label className="form-label">Comment {modalAction === 'rejected' ? '(required for rejection)' : '(optional)'}</label>
              <textarea className="form-textarea" rows={2} value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a note for the employee..." />
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
