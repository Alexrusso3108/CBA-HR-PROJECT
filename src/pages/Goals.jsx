import { useState } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { PriorityBadge } from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import { getGoals, addGoal, updateGoal, deleteGoal } from '../store/dataStore';

const PRIORITIES = ['high', 'medium', 'low'];
const PRIORITY_COLORS = { high: '#fc5c7d', medium: '#f6ad55', low: '#38ef7d' };
const STATUS_LABELS = { in_progress: 'In Progress', completed: 'Completed', not_started: 'Not Started' };

function GoalCard({ goal, onEdit, onDelete, onUpdateProgress }) {
  const pct = goal.progress;
  return (
    <div className="card" style={{ borderTop: `3px solid ${PRIORITY_COLORS[goal.priority]}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>{goal.description}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <PriorityBadge priority={goal.priority} />
            <span className={`badge badge-${goal.status}`}>{STATUS_LABELS[goal.status] || goal.status}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => onEdit(goal)}><Edit2 size={13} /></button>
          <button className="icon-btn" style={{ width: 30, height: 30, color: 'var(--accent-danger)' }} onClick={() => onDelete(goal.id)}><Trash2 size={13} /></button>
        </div>
      </div>

      <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 4 }}>
        <strong style={{ color: 'var(--text-2)' }}>Metric:</strong> {goal.successMetrics}
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 14 }}>
        <strong style={{ color: 'var(--text-2)' }}>Deadline:</strong> {goal.deadline}
      </div>

      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>
          <span>Progress</span><span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{pct}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
        {[0, 25, 50, 75, 100].map(v => (
          <button key={v} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: 11, borderColor: pct === v ? 'var(--accent)' : undefined, color: pct === v ? 'var(--accent-light)' : undefined }}
            onClick={() => onUpdateProgress(goal.id, v)}>
            {v}%
          </button>
        ))}
      </div>
    </div>
  );
}

const emptyForm = { description: '', deadline: '', priority: 'medium', successMetrics: '', year: new Date().getFullYear() };

export default function Goals() {
  const { user } = useAuth();
  const [tab, setTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [alert, setAlert] = useState(null);

  const goals = getGoals({ employeeId: user.id });
  const inProgress = goals.filter(g => g.status === 'in_progress');
  const completed = goals.filter(g => g.status === 'completed');

  function showAlert(type, msg) {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3000);
  }

  function openAdd() { setEditing(null); setForm(emptyForm); setFormError(''); setShowModal(true); }
  function openEdit(goal) { setEditing(goal); setForm({ description: goal.description, deadline: goal.deadline, priority: goal.priority, successMetrics: goal.successMetrics, year: goal.year }); setFormError(''); setShowModal(true); }

  function handleSave() {
    setFormError('');
    if (!form.description.trim()) { setFormError('Goal description is required.'); return; }
    if (!form.deadline) { setFormError('Please set a deadline.'); return; }
    if (!form.successMetrics.trim()) { setFormError('Please define success metrics.'); return; }
    if (editing) {
      updateGoal(editing.id, form);
      showAlert('success', 'Goal updated!');
    } else {
      addGoal({ ...form, employeeId: user.id });
      showAlert('success', 'Goal added!');
    }
    setShowModal(false);
    setRefresh(r => r + 1);
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this goal?')) return;
    deleteGoal(id);
    setRefresh(r => r + 1);
    showAlert('info', 'Goal deleted.');
  }

  function handleProgress(id, pct) {
    updateGoal(id, { progress: pct });
    setRefresh(r => r + 1);
  }

  const displayed = tab === 'all' ? goals : tab === 'in_progress' ? inProgress : completed;

  return (
    <Layout title="My Goals">
      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Goals & Targets</h1>
          <p>Track your annual goals and measure progress</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Goal</button>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {[{ label: 'Total Goals', val: goals.length, color: '#6c63ff' }, { label: 'In Progress', val: inProgress.length, color: '#f6ad55' }, { label: 'Completed', val: completed.length, color: '#38ef7d' }].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: `${s.color}18` }}>
              <TrendingUp size={20} color={s.color} />
            </div>
            <div><div className="stat-label">{s.label}</div><div className="stat-value">{s.val}</div></div>
          </div>
        ))}
      </div>

      <div className="tabs">
        {[['all', 'All Goals'], ['in_progress', 'In Progress'], ['completed', 'Completed']].map(([v, l]) => (
          <button key={v} className={`tab-btn ${tab === v ? 'active' : ''}`} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div className="empty-state card"><TrendingUp size={40} color="#cbd5e1" /><h3>No goals found</h3><p>Set meaningful goals to track your professional growth this year.</p></div>
      ) : (
        <div className="grid-2">
          {displayed.map(g => (
            <GoalCard key={g.id} goal={g} onEdit={openEdit} onDelete={handleDelete} onUpdateProgress={handleProgress} />
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Goal' : 'Add New Goal'} size="md"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Save Changes' : 'Add Goal'}</button>
          </>
        }
      >
        {formError && <div className="alert alert-error"><AlertCircle size={14} /> {formError}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Goal Description</label>
            <textarea className="form-textarea" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What do you want to achieve?" />
          </div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input className="form-input" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Success Metrics</label>
            <textarea className="form-textarea" rows={2} value={form.successMetrics} onChange={e => setForm({ ...form, successMetrics: e.target.value })} placeholder="How will you measure success?" />
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
