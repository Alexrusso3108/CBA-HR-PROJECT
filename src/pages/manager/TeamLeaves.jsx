import { useState } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import Avatar from '../../components/Avatar';
import { useAuth } from '../../context/AuthContext';
import { getTeamMembers, getLeaveApplications, getLeaveBalance, reviewLeave, getEmployee } from '../../store/dataStore';

const LEAVE_LABELS = { CL: 'Casual Leave', SL: 'Sick Leave', PL: 'Paid Leave' };

function daysBetween(from, to) {
  return Math.max(1, Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1);
}

export default function TeamLeaves() {
  const { user, refreshNotifications } = useAuth();
  const [tab, setTab] = useState('pending');
  const [selectedApp, setSelectedApp] = useState(null);
  const [comment, setComment] = useState('');
  const [modalAction, setModalAction] = useState('');
  const [alert, setAlert] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const team = getTeamMembers(user.id);
  const teamIds = team.map(e => e.id);
  const allApps = getLeaveApplications({ teamIds });
  const pending = allApps.filter(a => a.status === 'pending');
  const reviewed = allApps.filter(a => a.status !== 'pending');

  function showAlert(type, msg) { setAlert({ type, msg }); setTimeout(() => setAlert(null), 3500); }

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
    showAlert(modalAction === 'approved' ? 'success' : 'info', `Leave application ${modalAction}.`);
  }

  function getEmpName(id) {
    const m = team.find(e => e.id === id);
    return m ? m.name : id;
  }

  const displayed = tab === 'pending' ? pending : reviewed;

  return (
    <Layout title="Team Leaves">
      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Team Leave Requests</h1>
          <p>Manage leave applications from your direct reports ({team.length} members)</p>
        </div>
      </div>

      {/* Team Members Leave Balance */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 16 }}>Team Leave Balances</div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Employee</th><th>ID</th><th>Casual (CL)</th><th>Sick (SL)</th><th>Paid (PL)</th><th>Status</th></tr></thead>
            <tbody>
              {team.map(emp => {
                const bal = getLeaveBalance(emp.id);
                return (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={emp.name} size="sm" />
                        <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{emp.name}</div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-3)' }}>{emp.id}</td>
                    <td><span style={{ fontWeight: 700, color: '#6c63ff' }}>{bal.CL}</span> days</td>
                    <td><span style={{ fontWeight: 700, color: '#38b2ac' }}>{bal.SL}</span> days</td>
                    <td><span style={{ fontWeight: 700, color: '#f6ad55' }}>{bal.PL}</span> days</td>
                    <td><Badge status={emp.status} /></td>
                  </tr>
                );
              })}
              {team.length === 0 && (
                <tr><td colSpan={6}><div className="empty-state" style={{ padding: 24 }}><p>No team members assigned</p></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applications */}
      <div className="tabs">
        <button className={`tab-btn ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
          Pending {pending.length > 0 && <span className="nav-badge" style={{ position: 'static', marginLeft: 6 }}>{pending.length}</span>}
        </button>
        <button className={`tab-btn ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>History</button>
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 16 }}>
          {tab === 'pending' ? 'Pending Requests' : 'Reviewed Applications'} ({displayed.length})
        </div>
        {displayed.length === 0 ? (
          <div className="empty-state"><CalendarDays size={40} color="#cbd5e1" /><h3>All up to date</h3><p>No {tab === 'pending' ? 'pending' : ''} leave requests at this time.</p></div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Employee</th><th>Leave Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Applied</th><th>Status</th>{tab === 'pending' && <th>Actions</th>}</tr>
              </thead>
              <tbody>
                {displayed.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar name={getEmpName(a.employeeId)} size="sm" />
                        <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{getEmpName(a.employeeId)}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: a.type === 'CL' ? '#6c63ff' : a.type === 'SL' ? '#38b2ac' : '#f6ad55' }}>{LEAVE_LABELS[a.type]}</td>
                    <td>{a.fromDate}</td><td>{a.toDate}</td>
                    <td style={{ fontWeight: 700 }}>{daysBetween(a.fromDate, a.toDate)}</td>
                    <td style={{ maxWidth: 180 }}><span className="truncate" style={{ display: 'block', fontSize: 12.5 }}>{a.reason}</span></td>
                    <td style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{a.appliedOn}</td>
                    <td><Badge status={a.status} /></td>
                    {tab === 'pending' && (
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-success btn-sm" onClick={() => openReview(a, 'approved')}><Check size={13} /> Approve</button>
                          <button className="btn btn-danger btn-sm" onClick={() => openReview(a, 'rejected')}><X size={13} /> Reject</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title={`${modalAction === 'approved' ? 'Approve' : 'Reject'} Leave Request`} size="sm"
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
            <div style={{ padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 8, fontSize: 13.5, color: 'var(--text-1)' }}>
              <strong>{getEmpName(selectedApp.employeeId)}</strong> – {LEAVE_LABELS[selectedApp.type]}<br />
              <span style={{ color: 'var(--text-3)', fontSize: 12 }}>{selectedApp.fromDate} to {selectedApp.toDate} ({daysBetween(selectedApp.fromDate, selectedApp.toDate)} days)</span>
            </div>
            <div className="form-group">
              <label className="form-label">Comment {modalAction === 'rejected' ? '(required for rejection)' : '(optional)'}</label>
              <textarea className="form-textarea" rows={2} value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment for the employee..." />
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
