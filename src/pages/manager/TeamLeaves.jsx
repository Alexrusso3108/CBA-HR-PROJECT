<<<<<<< HEAD
import { useState, useMemo } from 'react';
import { Check, X, AlertCircle, CalendarDays } from 'lucide-react';
=======
import { useState } from 'react';
import { Check, X, CalendarDays } from 'lucide-react';
>>>>>>> d7bbb1ccf3a402a99d95a3f02adfbfcc1fecc004
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import Avatar from '../../components/Avatar';
import { useAuth } from '../../context/AuthContext';
<<<<<<< HEAD
import { getTeamMembers, getLeaveApplications, getLeaveBalance, reviewLeave } from '../../store/dataStore';
=======
import { supabase } from '../../lib/supabase';
import { useCompanyData } from '../../hooks/useCompanyData';
>>>>>>> d7bbb1ccf3a402a99d95a3f02adfbfcc1fecc004

const LEAVE_LABELS = { CL: 'Casual Leave', SL: 'Sick Leave', PL: 'Paid Leave' };

function daysBetween(from, to) {
  return Math.max(1, Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1);
}

export default function TeamLeaves() {
  const { user } = useAuth();
  const { employees, leaveApplications, leaveBalances, loading, reload } = useCompanyData();

  const [tab, setTab] = useState('pending');
  const [selectedApp, setSelectedApp] = useState(null);
  const [comment, setComment] = useState('');
  const [modalAction, setModalAction] = useState('');
  const [alert, setAlert] = useState(null);
<<<<<<< HEAD
  const [, setRefresh] = useState(0);
=======
  const [saving, setSaving] = useState(false);
>>>>>>> d7bbb1ccf3a402a99d95a3f02adfbfcc1fecc004

  // Team = all employees whose managerId is the logged-in manager
  const team = employees.filter(e => e.managerId === user.id);
  const teamIds = team.map(e => e.id);
  const allApps = leaveApplications.filter(a => teamIds.includes(a.employeeId));
  const pending = allApps.filter(a => a.status === 'pending');
  const reviewed = allApps.filter(a => a.status !== 'pending');
  const displayed = tab === 'pending' ? pending : reviewed;

  function showAlert(type, msg) { setAlert({ type, msg }); setTimeout(() => setAlert(null), 3500); }

  function openReview(app, action) {
    setSelectedApp(app);
    setModalAction(action);
    setComment('');
  }

  async function handleReview() {
    if (!selectedApp) return;
    setSaving(true);
    try {
      // 1. Update leave application status
      const { error: appErr } = await supabase
        .from('leave_applications')
        .update({ status: modalAction, manager_comment: comment })
        .eq('id', selectedApp.id)
        .eq('company_id', user.company_id);
      if (appErr) throw appErr;

      // 2. If approved — deduct balance from leave_balances
      if (modalAction === 'approved') {
        const days = daysBetween(selectedApp.fromDate, selectedApp.toDate);
        const colMap = { CL: 'cl', SL: 'sl', PL: 'pl' };
        const col = colMap[selectedApp.type];
        const current = leaveBalances[selectedApp.employeeId] || { CL: 0, SL: 0, PL: 0 };
        const newVal = Math.max(0, (current[selectedApp.type] ?? 0) - days);

        const { error: balErr } = await supabase
          .from('leave_balances')
          .update({ [col]: newVal })
          .eq('employee_id', selectedApp.employeeId)
          .eq('company_id', user.company_id);
        if (balErr) throw balErr;
      }

      setSelectedApp(null);
      showAlert(modalAction === 'approved' ? 'success' : 'info', `Leave application ${modalAction}.`);
      reload();
    } catch (err) {
      showAlert('error', err?.message || 'Failed to update leave status.');
    } finally {
      setSaving(false);
    }
  }

  function getEmpName(id) {
    return employees.find(e => e.id === id)?.name || id;
  }

<<<<<<< HEAD
  const displayed = tab === 'pending' ? pending : reviewed;

  // Team mini leave calendar
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());

  const calDays = useMemo(() => {
    const first = new Date(calYear, calMonth, 1);
    const last = new Date(calYear, calMonth + 1, 0);
    const cells = [];
    for (let i = 0; i < first.getDay(); i++) cells.push(null);
    for (let d = 1; d <= last.getDate(); d++) cells.push(d);
    return cells;
  }, [calMonth, calYear]);

  // Map of day -> number of team members on approved leave
  const leaveCountByDay = {};
  allApps.forEach((a) => {
    if (a.status !== 'approved') return;
    let d = new Date(a.fromDate);
    const end = new Date(a.toDate);
    while (d <= end) {
      if (d.getMonth() === calMonth && d.getFullYear() === calYear) {
        const day = d.getDate();
        leaveCountByDay[day] = (leaveCountByDay[day] || 0) + 1;
      }
      d.setDate(d.getDate() + 1);
    }
  });

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

=======
>>>>>>> d7bbb1ccf3a402a99d95a3f02adfbfcc1fecc004
  return (
    <Layout title="Team Leaves">
      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Team Leave Requests</h1>
          <p>Manage leave applications from your direct reports ({loading ? '…' : team.length} members)</p>
        </div>
      </div>

      {/* Team Leave Balances */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 16 }}>Team Leave Balances</div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Employee</th><th>ID</th><th>Casual (CL)</th><th>Sick (SL)</th><th>Paid (PL)</th><th>Status</th></tr></thead>
            <tbody>
              {team.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state" style={{ padding: 24 }}><p>{loading ? 'Loading…' : 'No team members assigned'}</p></div></td></tr>
              ) : (
                team.map(emp => {
                  const bal = leaveBalances[emp.id] || { CL: 0, SL: 0, PL: 0 };
                  return (
                    <tr key={emp.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={emp.name} size="sm" />
                          <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{emp.name}</div>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-3)' }}>{emp.employeeCode}</td>
                      <td><span style={{ fontWeight: 700, color: '#6c63ff' }}>{bal.CL}</span> days</td>
                      <td><span style={{ fontWeight: 700, color: '#38b2ac' }}>{bal.SL}</span> days</td>
                      <td><span style={{ fontWeight: 700, color: '#f6ad55' }}>{bal.PL}</span> days</td>
                      <td><Badge status={emp.status} /></td>
                    </tr>
                  );
                })
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
        <button className={`tab-btn ${tab === 'calendar' ? 'active' : ''}`} onClick={() => setTab('calendar')}>Team Calendar</button>
      </div>

      {/* Pending / History tables */}
      {(tab === 'pending' || tab === 'history') && (
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
      )}

      {/* Team leave calendar */}
      {tab === 'calendar' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 4 }}>Team Leave Calendar</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>See which days your team members are on approved leave</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (calMonth === 0) {
                    setCalMonth(11);
                    setCalYear(y => y - 1);
                  } else {
                    setCalMonth(m => m - 1);
                  }
                }}
              >
                ‹
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (calMonth === 11) {
                    setCalMonth(0);
                    setCalYear(y => y + 1);
                  } else {
                    setCalMonth(m => m + 1);
                  }
                }}
              >
                ›
              </button>
            </div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10 }}>
            {monthNames[calMonth]} {calYear}
          </div>

          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="cal-header">{d}</div>
            ))}
            {calDays.map((d, i) => {
              if (!d) return <div key={i} className="cal-day other-month" />;
              const isToday = d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
              const count = leaveCountByDay[d] || 0;
              const hasLeave = count > 0;
              const cls = `cal-day${isToday ? ' today' : ''}${hasLeave ? ' leave' : ''}`;
              return (
                <div key={i} className={cls}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <span>{d}</span>
                    {hasLeave && (
                      <span style={{ fontSize: 9.5, color: '#059669', fontWeight: 700 }}>
                        {count} on leave
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title={`${modalAction === 'approved' ? 'Approve' : 'Reject'} Leave Request`} size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setSelectedApp(null)}>Cancel</button>
            <button className={`btn ${modalAction === 'approved' ? 'btn-success' : 'btn-danger'}`} onClick={handleReview} disabled={saving}>
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
