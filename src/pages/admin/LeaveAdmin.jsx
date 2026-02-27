import { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import Avatar from '../../components/Avatar';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useCompanyData } from '../../hooks/useCompanyData';

const LEAVE_TYPES = ['CL', 'SL', 'PL'];
const LEAVE_LABELS = { CL: 'Casual', SL: 'Sick', PL: 'Paid' };

export default function LeaveAdmin() {
  const { user } = useAuth();
  const { employees, leaveBalances, leaveApplications, holidays, loading, reload } = useCompanyData();

  const [tab, setTab] = useState('balances');
  const [alert, setAlert] = useState(null);
  const [editingBalance, setEditingBalance] = useState(null);
  const [balanceForm, setBalanceForm] = useState({ CL: 0, SL: 0, PL: 0 });
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayForm, setHolidayForm] = useState({ name: '', date: '', type: 'national' });
  const [saving, setSaving] = useState(false);

  const activeEmps = employees.filter(e => e.status === 'active');

  function showAlert(type, msg) { setAlert({ type, msg }); setTimeout(() => setAlert(null), 3500); }

  function openEditBalance(emp) {
    const bal = leaveBalances[emp.id] || { CL: 12, SL: 10, PL: 15 };
    setEditingBalance(emp);
    setBalanceForm({ CL: bal.CL, SL: bal.SL, PL: bal.PL });
  }

  async function saveBalance() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('leave_balances')
        .update({ cl: Number(balanceForm.CL), sl: Number(balanceForm.SL), pl: Number(balanceForm.PL) })
        .eq('employee_id', editingBalance.id)
        .eq('company_id', user.company_id);
      if (error) throw error;
      showAlert('success', `Leave balance updated for ${editingBalance.name}`);
      setEditingBalance(null);
      reload();
    } catch (err) {
      showAlert('error', err?.message || 'Failed to update balance.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddHoliday() {
    if (!holidayForm.name || !holidayForm.date) { showAlert('error', 'Name and date are required.'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('holidays').insert({
        company_id: user.company_id,
        name: holidayForm.name,
        date: holidayForm.date,
        type: holidayForm.type,
      });
      if (error) throw error;
      setHolidayForm({ name: '', date: '', type: 'national' });
      setShowHolidayModal(false);
      showAlert('success', 'Holiday added!');
      reload();
    } catch (err) {
      showAlert('error', err?.message || 'Failed to add holiday.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteHoliday(id) {
    if (!window.confirm('Remove this holiday?')) return;
    try {
      const { error } = await supabase.from('holidays').delete().eq('id', id).eq('company_id', user.company_id);
      if (error) throw error;
      showAlert('info', 'Holiday removed.');
      reload();
    } catch (err) {
      showAlert('error', err?.message || 'Failed to remove holiday.');
    }
  }

  const totalPending = leaveApplications.filter(l => l.status === 'pending').length;
  const totalApproved = leaveApplications.filter(l => l.status === 'approved').length;

  return (
    <Layout title="Leave Administration">
      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Leave Administration</h1>
          <p>Manage leave balances, applications, and company holidays</p>
        </div>
        {tab === 'holidays' && (
          <button className="btn btn-primary" onClick={() => setShowHolidayModal(true)}>
            <Plus size={15} /> Add Holiday
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Applications', val: leaveApplications.length, color: '#6c63ff' },
          { label: 'Pending Review', val: totalPending, color: '#f6ad55' },
          { label: 'Approved This Year', val: totalApproved, color: '#38ef7d' },
          { label: 'Company Holidays', val: holidays.length, color: '#38b2ac' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, marginRight: 4, flexShrink: 0 }} />
            <div><div className="stat-label">{s.label}</div><div className="stat-value">{s.val}</div></div>
          </div>
        ))}
      </div>

      <div className="tabs">
        {[['balances', 'Leave Balances'], ['applications', 'All Applications'], ['holidays', 'Holidays']].map(([v, l]) => (
          <button key={v} className={`tab-btn ${tab === v ? 'active' : ''}`} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

      {/* Tab: Balances */}
      {tab === 'balances' && (
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 16 }}>Employee Leave Balances</div>
          {loading ? (
            <div className="empty-state" style={{ padding: 32 }}><p>Loading…</p></div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Employee</th><th>ID</th><th>Casual (CL)</th><th>Sick (SL)</th><th>Paid (PL)</th><th>Action</th></tr></thead>
                <tbody>
                  {activeEmps.map(emp => {
                    const bal = leaveBalances[emp.id] || { CL: 0, SL: 0, PL: 0 };
                    return (
                      <tr key={emp.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar name={emp.name} size="sm" />
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{emp.name}</div>
                              <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{emp.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'monospace', color: 'var(--accent-light)' }}>{emp.employeeCode}</td>
                        <td><span style={{ fontWeight: 700, fontSize: 16, color: '#6c63ff' }}>{bal.CL}</span></td>
                        <td><span style={{ fontWeight: 700, fontSize: 16, color: '#38b2ac' }}>{bal.SL}</span></td>
                        <td><span style={{ fontWeight: 700, fontSize: 16, color: '#f6ad55' }}>{bal.PL}</span></td>
                        <td>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEditBalance(emp)}>
                            <Edit2 size={12} /> Adjust
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Applications */}
      {tab === 'applications' && (
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 16 }}>All Leave Applications</div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th>Applied On</th></tr></thead>
              <tbody>
                {leaveApplications.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty-state" style={{ padding: 24 }}><p>No leave applications</p></div></td></tr>
                ) : (
                  leaveApplications.map(a => {
                    const emp = employees.find(e => e.id === a.employeeId);
                    return (
                      <tr key={a.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar name={emp?.name || '?'} size="sm" />
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-1)', fontSize: 13 }}>{emp?.name || '—'}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{emp?.employeeCode}</div>
                            </div>
                          </div>
                        </td>
                        <td><span style={{ fontWeight: 700, color: a.type === 'CL' ? '#6c63ff' : a.type === 'SL' ? '#38b2ac' : '#f6ad55' }}>{LEAVE_LABELS[a.type]}</span></td>
                        <td>{a.fromDate}</td><td>{a.toDate}</td>
                        <td style={{ maxWidth: 180, fontSize: 12.5 }}><span className="truncate" style={{ display: 'block' }}>{a.reason}</span></td>
                        <td><Badge status={a.status} /></td>
                        <td style={{ fontSize: 12, color: 'var(--text-3)' }}>{a.appliedOn}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Holidays */}
      {tab === 'holidays' && (
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 16 }}>Company Holidays ({holidays.length})</div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>#</th><th>Holiday Name</th><th>Date</th><th>Day</th><th>Type</th><th>Action</th></tr></thead>
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
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteHoliday(h.id)}>
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Balance Modal */}
      <Modal isOpen={!!editingBalance} onClose={() => setEditingBalance(null)} title={`Adjust Leave Balance – ${editingBalance?.name}`} size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setEditingBalance(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveBalance} disabled={saving}>Save Balance</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {LEAVE_TYPES.map(t => (
            <div key={t} className="form-group">
              <label className="form-label">{LEAVE_LABELS[t]} Leave (days)</label>
              <input className="form-input" type="number" min={0} max={365} value={balanceForm[t]} onChange={e => setBalanceForm({ ...balanceForm, [t]: e.target.value })} />
            </div>
          ))}
        </div>
      </Modal>

      {/* Add Holiday Modal */}
      <Modal isOpen={showHolidayModal} onClose={() => setShowHolidayModal(false)} title="Add Company Holiday" size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowHolidayModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddHoliday} disabled={saving}>Add Holiday</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Holiday Name</label>
            <input className="form-input" value={holidayForm.name} onChange={e => setHolidayForm({ ...holidayForm, name: e.target.value })} placeholder="e.g. Diwali" />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={holidayForm.date} onChange={e => setHolidayForm({ ...holidayForm, date: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-select" value={holidayForm.type} onChange={e => setHolidayForm({ ...holidayForm, type: e.target.value })}>
              <option value="national">National</option>
              <option value="festival">Festival</option>
              <option value="optional">Optional</option>
            </select>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
