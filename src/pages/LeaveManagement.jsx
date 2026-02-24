import { useState, useMemo } from 'react';
import { Plus, CalendarDays, X, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import {
  getLeaveBalance, getLeaveApplications, applyLeave, cancelLeave,
  getHolidays, getEmployee
} from '../store/dataStore';

const LEAVE_TYPES = ['CL', 'SL', 'PL'];
const LEAVE_LABELS = { CL: 'Casual Leave', SL: 'Sick Leave', PL: 'Paid Leave' };
const LEAVE_COLORS = { CL: '#6c63ff', SL: '#38b2ac', PL: '#f6ad55' };

function daysBetween(from, to) {
  const d1 = new Date(from), d2 = new Date(to);
  return Math.max(1, Math.ceil((d2 - d1) / 86400000) + 1);
}

export default function LeaveManagement() {
  const { user, refreshNotifications } = useAuth();
  const [tab, setTab] = useState('overview');
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ type: 'CL', fromDate: '', toDate: '', reason: '' });
  const [formError, setFormError] = useState('');
  const [alert, setAlert] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const balance = getLeaveBalance(user.id);
  const applications = getLeaveApplications({ employeeId: user.id });
  const holidays = getHolidays();
  const manager = user.managerId ? getEmployee(user.managerId) : null;

  function showAlert(type, msg) {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3500);
  }

  function handleApply() {
    setFormError('');
    if (!form.fromDate || !form.toDate) { setFormError('Please select date range.'); return; }
    if (new Date(form.toDate) < new Date(form.fromDate)) { setFormError('End date cannot be before start date.'); return; }
    if (!form.reason.trim()) { setFormError('Please provide a reason.'); return; }
    const days = daysBetween(form.fromDate, form.toDate);
    if (balance[form.type] < days) { setFormError(`Insufficient ${LEAVE_LABELS[form.type]} balance. Available: ${balance[form.type]} days.`); return; }
    applyLeave({ employeeId: user.id, ...form });
    refreshNotifications();
    setShowApply(false);
    setForm({ type: 'CL', fromDate: '', toDate: '', reason: '' });
    setRefresh(r => r + 1);
    showAlert('success', 'Leave application submitted successfully!');
  }

  function handleCancel(leaveId) {
    if (!window.confirm('Cancel this leave application?')) return;
    cancelLeave(leaveId, user.id);
    setRefresh(r => r + 1);
    showAlert('info', 'Leave application cancelled.');
  }

  const pendingApps = applications.filter(a => a.status === 'pending');
  const approvedApps = applications.filter(a => a.status === 'approved');

  // Mini calendar
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

  const holidayDates = new Set(holidays.filter(h => {
    const d = new Date(h.date);
    return d.getMonth() === calMonth && d.getFullYear() === calYear;
  }).map(h => new Date(h.date).getDate()));

  const leaveDates = useMemo(() => {
    const set = new Set();
    applications.forEach(a => {
      if (a.status === 'approved') {
        let d = new Date(a.fromDate);
        const end = new Date(a.toDate);
        while (d <= end) {
          if (d.getMonth() === calMonth && d.getFullYear() === calYear) set.add(d.getDate());
          d.setDate(d.getDate() + 1);
        }
      }
    });
    return set;
  }, [applications, calMonth, calYear]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <Layout title="Leave Management">
      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      <div className="page-header">
        <div className="page-header-left">
          <h1>My Leaves</h1>
          <p>Manage your leave applications and view balance</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowApply(true)}>
          <Plus size={15} /> Apply for Leave
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {LEAVE_TYPES.map(t => (
          <div key={t} className="stat-card" style={{ borderLeft: `3px solid ${LEAVE_COLORS[t]}` }}>
            <div className="stat-icon" style={{ background: `${LEAVE_COLORS[t]}18` }}>
              <CalendarDays size={20} color={LEAVE_COLORS[t]} />
            </div>
            <div>
              <div className="stat-label">{LEAVE_LABELS[t]}</div>
              <div className="stat-value">{balance[t] ?? 0}</div>
              <div className="stat-sub">days remaining</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['overview', 'pending', 'history', 'calendar', 'holidays'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === 'overview' && (
        <div className="grid-2">
          {/* Manager Info */}
          {manager && (
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)', marginBottom: 14 }}>Your Reporting Manager</div>
              <div style={{ padding: '14px 16px', background: 'var(--bg-surface)', borderRadius: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>{manager.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{manager.email}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{manager.phone}</div>
              </div>
            </div>
          )}
          {/* Recent */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)', marginBottom: 14 }}>Recent Applications</div>
            {applications.length === 0 ? <div className="empty-state" style={{ padding: 24 }}><CalendarDays size={36} color="#cbd5e1" /><p>No applications yet</p></div> : (
              applications.slice(0, 4).map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{LEAVE_LABELS[a.type]}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{a.fromDate} &ndash; {a.toDate}</div>
                  </div>
                  <Badge status={a.status} />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Pending */}
      {tab === 'pending' && (
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 16 }}>Pending Applications ({pendingApps.length})</div>
          {pendingApps.length === 0 ? (
            <div className="empty-state"><CalendarDays size={40} color="#cbd5e1" /><h3>No pending applications</h3><p>All leave requests have been processed.</p></div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Applied On</th><th>Action</th></tr></thead>
                <tbody>
                  {pendingApps.map(a => (
                    <tr key={a.id}>
                      <td><span style={{ fontWeight: 600, color: LEAVE_COLORS[a.type] }}>{a.type}</span></td>
                      <td>{a.fromDate}</td><td>{a.toDate}</td>
                      <td>{daysBetween(a.fromDate, a.toDate)}</td>
                      <td style={{ maxWidth: 200 }}><span className="truncate" style={{ display: 'block' }}>{a.reason}</span></td>
                      <td>{a.appliedOn}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(a.id)}>
                          <X size={12} /> Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: History */}
      {tab === 'history' && (
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 16 }}>Leave History</div>
          {applications.length === 0 ? (
            <div className="empty-state"><CalendarDays size={40} color="#cbd5e1" /><p>No leave history</p></div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th><th>Manager Comment</th><th>Applied On</th></tr></thead>
                <tbody>
                  {applications.map(a => (
                    <tr key={a.id}>
                      <td><span style={{ fontWeight: 600, color: LEAVE_COLORS[a.type] }}>{LEAVE_LABELS[a.type]}</span></td>
                      <td>{a.fromDate}</td><td>{a.toDate}</td>
                      <td>{daysBetween(a.fromDate, a.toDate)}</td>
                      <td><Badge status={a.status} /></td>
                      <td style={{ maxWidth: 200, fontSize: 12.5, color: 'var(--text-3)' }}>{a.managerComment || '—'}</td>
                      <td>{a.appliedOn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Calendar */}
      {tab === 'calendar' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-1)' }}>{monthNames[calMonth]} {calYear}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}>‹</button>
              <button className="btn btn-secondary btn-sm" onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}>›</button>
            </div>
          </div>
          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="cal-header">{d}</div>)}
            {calDays.map((d, i) => (
              <div key={i} className={`cal-day ${!d ? '' : d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear() ? 'today' : holidayDates.has(d) ? 'holiday' : leaveDates.has(d) ? 'leave' : ''}`}>
                {d}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
            {[{ color: 'var(--accent-glow)', label: 'Today' }, { color: 'rgba(252,92,125,0.2)', label: 'Holiday' }, { color: 'rgba(56,239,125,0.1)', label: 'Approved Leave' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-3)' }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color, border: '1px solid rgba(255,255,255,0.1)' }} />{l.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Holidays */}
      {tab === 'holidays' && (
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 16 }}>Company Holiday Calendar {new Date().getFullYear()}</div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>#</th><th>Holiday</th><th>Date</th><th>Day</th><th>Type</th></tr></thead>
              <tbody>
                {holidays.map((h, i) => {
                  const d = new Date(h.date);
                  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
                  return (
                    <tr key={h.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-1)' }}>{h.name}</td>
                      <td>{h.date}</td>
                      <td style={{ color: 'var(--text-3)' }}>{dayName}</td>
                      <td><span className={`badge ${h.type === 'national' ? 'badge-info' : 'badge-pending'}`}>{h.type}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      <Modal isOpen={showApply} onClose={() => { setShowApply(false); setFormError(''); }} title="Apply for Leave" size="md"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowApply(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleApply}>Submit Application</button>
          </>
        }
      >
        {formError && <div className="alert alert-error"><AlertCircle size={14} /> {formError}</div>}
        {manager && (
          <div style={{ padding: '10px 14px', background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 8, marginBottom: 16, fontSize: 12.5, color: 'var(--text-2)' }}>
            Leave request will be sent to: <strong style={{ color: 'var(--accent-light)' }}>{manager.name}</strong> ({manager.email})
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Leave Type</label>
            <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {LEAVE_TYPES.map(t => <option key={t} value={t}>{LEAVE_LABELS[t]} ({balance[t]} days left)</option>)}
            </select>
          </div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group">
              <label className="form-label">From Date</label>
              <input className="form-input" type="date" value={form.fromDate} onChange={e => setForm({ ...form, fromDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">To Date</label>
              <input className="form-input" type="date" value={form.toDate} min={form.fromDate} onChange={e => setForm({ ...form, toDate: e.target.value })} />
            </div>
          </div>
          {form.fromDate && form.toDate && (
            <div className="alert alert-info" style={{ marginBottom: 0 }}>
              Duration: <strong>{daysBetween(form.fromDate, form.toDate)} day(s)</strong>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Reason</label>
            <textarea className="form-textarea" rows={3} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Please provide a reason for your leave..." />
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
