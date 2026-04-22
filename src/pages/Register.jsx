import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart2, Building2, User, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';

const FEATURES = [
  'Leave management & approvals',
  'Performance reviews & goals',
  'Employee directory & org chart',
  'Role-based access control',
  'HR analytics & reports',
];

export default function Register() {
  const { registerCompany } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    companyName: '',
    adminName: '',
    adminEmail: '',
    password: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.companyName.trim()) return setError('Company name is required.');
    if (!form.adminName.trim()) return setError('Your name is required.');
    if (!form.adminEmail.trim()) return setError('Your email is required.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    const result = await registerCompany(
      form.companyName.trim(),
      form.adminName.trim(),
      form.adminEmail.trim(),
      form.password
    );
    setLoading(false);

    if (!result.success) {
      setError(result.message || 'Registration failed. Please try again.');
    } else {
      navigate('/dashboard');
    }
  }

  return (
    <div style={{
      display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden',
      background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif',
    }}>

      {/* ── LEFT: Brand panel ─────────────────────────────────── */}
      <div style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '40px 48px',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, position: 'relative', zIndex: 2 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 13,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 24px rgba(79,70,229,0.45)',
          }}>
            <BarChart2 size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: '#fff', letterSpacing: -0.4 }}>Rev Workforce</div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)', fontWeight: 400 }}>Human Resource Management System</div>
          </div>
        </div>

        {/* Hero copy */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{
            fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 900, color: '#fff',
            lineHeight: 1.15, marginBottom: 14, letterSpacing: -1,
          }}>
            One platform for your<br />
            <span style={{ background: 'linear-gradient(90deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              entire workforce.
            </span>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.60)', lineHeight: 1.7, marginBottom: 32, maxWidth: 380 }}>
            Set up your company in seconds. Your team gets instant access to leave management, performance reviews, and more.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {FEATURES.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 size={16} color="#818cf8" />
                <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.78)', fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)', position: 'relative', zIndex: 2 }}>
          © 2026 Rev Workforce. All rights reserved.
        </div>
      </div>

      {/* ── RIGHT: Register form ───────────────────────────────── */}
      <div style={{
        width: 480, flexShrink: 0, background: '#fff',
        borderLeft: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 44px', overflowY: 'auto',
        boxShadow: '-12px 0 48px rgba(15,23,42,0.06)',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 5, letterSpacing: -0.4 }}>
              Create your company
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Register as admin and invite your team after setup.
            </div>
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 9,
              background: '#fff5f5', border: '1px solid #fecaca',
              color: '#dc2626', fontSize: 13, fontWeight: 500, marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Company Name */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building2 size={13} color="#7c3aed" /> Company Name
              </label>
              <input
                className="form-input"
                id="company-name"
                placeholder="e.g. Acme Corp"
                value={form.companyName}
                onChange={set('companyName')}
                autoComplete="organization"
                required
              />
            </div>

            {/* Admin Name */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={13} color="#7c3aed" /> Your Full Name
              </label>
              <input
                className="form-input"
                id="admin-name"
                placeholder="e.g. John Doe"
                value={form.adminName}
                onChange={set('adminName')}
                autoComplete="name"
                required
              />
            </div>

            {/* Admin Email */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={13} color="#7c3aed" /> Work Email
              </label>
              <input
                className="form-input"
                id="admin-email"
                type="email"
                placeholder="e.g. john@acmecorp.com"
                value={form.adminEmail}
                onChange={set('adminEmail')}
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={13} color="#7c3aed" /> Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  id="register-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="new-password"
                  style={{ paddingRight: 44 }}
                  required
                />
                <button type="button" onClick={() => setShowPass((s) => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={13} color="#7c3aed" /> Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  autoComplete="new-password"
                  style={{ paddingRight: 44 }}
                  required
                />
                <button type="button" onClick={() => setShowConfirm((s) => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="register-btn"
              className="btn btn-primary"
              disabled={loading}
              style={{ justifyContent: 'center', padding: '12px', fontSize: 14.5, marginTop: 6, borderRadius: 10, fontWeight: 700, width: '100%', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              {loading ? (
                <>
                  <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Setting up your company...
                </>
              ) : (
                <>Create Company Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#64748b' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
              Sign in here
            </Link>
          </div>

          <div style={{ marginTop: 20, padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e8edf2' }}>
            <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6 }}>
              🔐 Your password is stored securely using bcrypt hashing. We never store plain-text passwords.
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
