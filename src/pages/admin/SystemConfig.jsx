import { useState } from 'react';
import { Plus, Trash2, Settings, Building2, Megaphone, Info } from 'lucide-react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { getDepartments, getDesignations, addDepartment, addDesignation, getAnnouncements, addAnnouncement, removeAnnouncement } from '../../store/dataStore';

export default function SystemConfig() {
  const [tab, setTab] = useState('departments');
  const [alert, setAlert] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const [deptName, setDeptName] = useState('');
  const [desName, setDesName] = useState('');
  const [desDeptId, setDesDeptId] = useState('');

  const [showAnn, setShowAnn] = useState(false);
  const [annForm, setAnnForm] = useState({ title: '', content: '', date: new Date().toISOString().split('T')[0], priority: 'medium' });

  const departments = getDepartments();
  const designations = getDesignations();
  const announcements = getAnnouncements();

  function showAlert(type, msg) { setAlert({ type, msg }); setTimeout(() => setAlert(null), 3000); }

  function handleAddDept() {
    if (!deptName.trim()) { showAlert('error', 'Department name required.'); return; }
    addDepartment(deptName.trim());
    setDeptName('');
    setRefresh(r => r + 1);
    showAlert('success', 'Department added!');
  }

  function handleAddDes() {
    if (!desName.trim()) { showAlert('error', 'Designation name required.'); return; }
    if (!desDeptId) { showAlert('error', 'Please select a department.'); return; }
    addDesignation(desName.trim(), desDeptId);
    setDesName('');
    setRefresh(r => r + 1);
    showAlert('success', 'Designation added!');
  }

  function handleAddAnn() {
    if (!annForm.title || !annForm.content) { showAlert('error', 'Title and content required.'); return; }
    addAnnouncement(annForm);
    setShowAnn(false);
    setAnnForm({ title: '', content: '', date: new Date().toISOString().split('T')[0], priority: 'medium' });
    setRefresh(r => r + 1);
    showAlert('success', 'Announcement published!');
  }

  function handleDeleteAnn(id) {
    if (!window.confirm('Delete announcement?')) return;
    removeAnnouncement(id);
    setRefresh(r => r + 1);
    showAlert('info', 'Announcement deleted.');
  }

  return (
    <Layout title="System Configuration">
      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
      <div className="page-header">
        <div className="page-header-left">
          <h1>System Configuration</h1>
          <p>Manage departments, designations, and company announcements</p>
        </div>
        {tab === 'announcements' && (
          <button className="btn btn-primary" onClick={() => setShowAnn(true)}><Plus size={15} /> New Announcement</button>
        )}
      </div>

      <div className="tabs">
        {[['departments', 'Departments & Designations'], ['announcements', 'Announcements'], ['audit', 'Audit Log']].map(([v, l]) => (
          <button key={v} className={`tab-btn ${tab === v ? 'active' : ''}`} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

      {/* Departments & Designations */}
      {tab === 'departments' && (
        <div className="grid-2">
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={16} color="var(--accent-light)" /> Departments ({departments.length})
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input className="form-input" placeholder="New department name" value={deptName} onChange={e => setDeptName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddDept()} />
              <button className="btn btn-primary btn-sm" onClick={handleAddDept} style={{ whiteSpace: 'nowrap' }}><Plus size={14} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {departments.map(d => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>{d.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{designations.filter(ds => ds.deptId === d.id).length} roles</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Settings size={16} color="var(--accent-light)" /> Designations ({designations.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <select className="form-select" value={desDeptId} onChange={e => setDesDeptId(e.target.value)}>
                <option value="">Select Department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" placeholder="New designation name" value={desName} onChange={e => setDesName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddDes()} />
                <button className="btn btn-primary btn-sm" onClick={handleAddDes}><Plus size={14} /></button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
              {designations.map(d => {
                const dept = departments.find(dep => dep.id === d.deptId);
                return (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{d.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{dept?.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Announcements */}
      {tab === 'announcements' && (
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 16 }}>Company Announcements</div>
          {announcements.length === 0 ? (
            <div className="empty-state"><Megaphone size={40} color="#cbd5e1" /><p>No announcements published</p></div>
          ) : (
            announcements.map(a => (
              <div key={a.id} style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: 10, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{a.title}</span>
                      <span className={`badge badge-${a.priority}`}>{a.priority}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 6 }}>{a.content}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Posted: {a.date}</div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteAnn(a.id)}><Trash2 size={12} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Audit Log */}
      {tab === 'audit' && (
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 16 }}>System Audit Log</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#0369a1' }}>
            <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>Audit logging captures key system actions. All data is persisted in localStorage for this prototype.</span>
          </div>
          {[
            { action: 'Employee Updated', actor: 'Admin User', target: 'Sarah Mitchell (EMP002)', time: '2026-02-23 10:14 AM' },
            { action: 'Leave Approved', actor: 'Sarah Mitchell', target: 'James Carter – CL Leave', time: '2026-03-02 10:30 AM' },
            { action: 'Performance Review Submitted', actor: 'Priya Sharma', target: 'FY 2025 Review', time: '2026-01-12 02:00 PM' },
            { action: 'Holiday Added', actor: 'Admin User', target: 'Diwali – Oct 20', time: '2026-01-05 09:00 AM' },
            { action: 'Leave Balance Adjusted', actor: 'Admin User', target: 'Rahul Verma – CL: 12', time: '2026-01-01 11:00 AM' },
            { action: 'New Employee Added', actor: 'Admin User', target: 'Lisa Wang (EMP006)', time: '2021-11-01 08:30 AM' },
          ].map((log, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginTop: 6, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>{log.action}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>By: {log.actor} · {log.target}</div>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{log.time}</div>
            </div>
          ))}
        </div>
      )}

      {/* New Announcement Modal */}
      <Modal isOpen={showAnn} onClose={() => setShowAnn(false)} title="Publish Announcement" size="md"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowAnn(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddAnn}>Publish</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" value={annForm.title} onChange={e => setAnnForm({ ...annForm, title: e.target.value })} placeholder="Announcement title" />
          </div>
          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea className="form-textarea" rows={4} value={annForm.content} onChange={e => setAnnForm({ ...annForm, content: e.target.value })} placeholder="Announcement details..." />
          </div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={annForm.date} onChange={e => setAnnForm({ ...annForm, date: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={annForm.priority} onChange={e => setAnnForm({ ...annForm, priority: e.target.value })}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
