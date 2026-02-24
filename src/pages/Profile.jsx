import { useState } from 'react';
import { User, Phone, MapPin, Heart, Lock, Save, Edit2, Shield } from 'lucide-react';
import Layout from '../components/Layout';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { updateEmployee, changePassword, getDepartments, getDesignations, getEmployee } from '../store/dataStore';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const departments = getDepartments();
  const designations = getDesignations();
  const manager = user.managerId ? getEmployee(user.managerId) : null;

  const dept = departments.find((d) => d.id === user.departmentId);
  const des = designations.find((d) => d.id === user.designationId);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ phone: user.phone, address: user.address, emergencyContact: user.emergencyContact });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const [showPwd, setShowPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  async function saveProfile() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    updateEmployee(user.id, form);
    refreshUser();
    setEditMode(false);
    setSaving(false);
    setAlert({ type: 'success', msg: 'Profile updated successfully!' });
    setTimeout(() => setAlert(null), 3000);
  }

  async function savePassword() {
    setPwdError(''); setPwdSuccess('');
    if (pwdForm.next !== pwdForm.confirm) { setPwdError('New passwords do not match.'); return; }
    if (pwdForm.next.length < 6) { setPwdError('Password must be at least 6 characters.'); return; }
    const res = changePassword(user.id, pwdForm.current, pwdForm.next);
    if (!res.success) { setPwdError(res.message); return; }
    setPwdSuccess('Password changed successfully!');
    setPwdForm({ current: '', next: '', confirm: '' });
    setTimeout(() => { setShowPwd(false); setPwdSuccess(''); }, 2000);
  }

  function InfoRow({ icon: Icon, label, value, color = 'var(--accent-light)' }) {
    return (
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
          <Icon size={16} color={color} />
        </div>
        <div>
          <div style={{ fontSize: 11.5, color: 'var(--text-3)', fontWeight: 600, marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 14, color: 'var(--text-1)', fontWeight: 500 }}>{value || '—'}</div>
        </div>
      </div>
    );
  }

  return (
    <Layout title="My Profile">
      {alert && <div className={`alert alert-${alert.type}`} style={{ marginBottom: 20 }}>{alert.msg}</div>}

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Left – Identity */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
              <Avatar name={user.name} size="xl" />
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)' }}>{user.name}</div>
                <div style={{ fontSize: 13.5, color: 'var(--text-2)', marginBottom: 4 }}>{des?.name}</div>
                <span className="badge badge-active" style={{ textTransform: 'capitalize' }}>{user.role}</span>
              </div>
            </div>

            <InfoRow icon={User} label="Employee ID" value={user.id} />
            <InfoRow icon={User} label="Email" value={user.email} />
            <InfoRow icon={User} label="Department" value={dept?.name} color="#38b2ac" />
            <InfoRow icon={User} label="Designation" value={des?.name} color="#a855f7" />
            <InfoRow icon={User} label="Date of Birth" value={user.dob} color="#f6ad55" />
            <InfoRow icon={User} label="Joining Date" value={user.joiningDate} color="#38ef7d" />
            {manager && (
              <InfoRow icon={User} label="Reporting Manager" value={`${manager.name} (${manager.id})`} color="#fc5c7d" />
            )}
          </div>

          {/* Password */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={16} color="var(--accent-light)" /> Security
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowPwd(true)}>
                <Lock size={13} /> Change Password
              </button>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-3)' }}>
              Keep your account secure by using a strong, unique password.
            </div>
          </div>
        </div>

        {/* Right – Editable */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>Contact Information</div>
            {!editMode ? (
              <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(true)}>
                <Edit2 size={13} /> Edit
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={saveProfile} disabled={saving}>
                  <Save size={13} /> {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label"><Phone size={12} style={{ display: 'inline' }} /> Phone Number</label>
              {editMode ? (
                <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
              ) : (
                <div style={{ padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 8, fontSize: 14, color: 'var(--text-1)' }}>{user.phone}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label"><MapPin size={12} style={{ display: 'inline' }} /> Address</label>
              {editMode ? (
                <textarea className="form-textarea" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Your address" rows={3} />
              ) : (
                <div style={{ padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 8, fontSize: 14, color: 'var(--text-1)' }}>{user.address}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label"><Heart size={12} style={{ display: 'inline' }} /> Emergency Contact</label>
              {editMode ? (
                <input className="form-input" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} placeholder="Emergency contact number" />
              ) : (
                <div style={{ padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 8, fontSize: 14, color: 'var(--text-1)' }}>{user.emergencyContact}</div>
              )}
            </div>
          </div>

          {/* Manager Card */}
          {manager && (
            <>
              <div className="divider" />
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)', marginBottom: 12 }}>Your Manager</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--bg-surface)', borderRadius: 10 }}>
                <Avatar name={manager.name} size="md" />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{manager.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{manager.email}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{manager.phone}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal isOpen={showPwd} onClose={() => { setShowPwd(false); setPwdError(''); setPwdSuccess(''); }} title="Change Password" size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowPwd(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={savePassword}>Update Password</button>
          </>
        }
      >
        {pwdError && <div className="alert alert-error">{pwdError}</div>}
        {pwdSuccess && <div className="alert alert-success">{pwdSuccess}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input className="form-input" type="password" value={pwdForm.current} onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input className="form-input" type="password" value={pwdForm.next} onChange={(e) => setPwdForm({ ...pwdForm, next: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input className="form-input" type="password" value={pwdForm.confirm} onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })} />
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
