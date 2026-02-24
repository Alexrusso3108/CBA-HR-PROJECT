import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, BarChart2, Shield, Users, Briefcase } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { label: 'Employee', id: 'EMP003', pass: 'password123', icon: Users, color: '#818cf8', bg: 'rgba(129,140,248,0.15)' },
  { label: 'Manager', id: 'EMP002', pass: 'password123', icon: Briefcase, color: '#38bdf8', bg: 'rgba(56,189,248,0.15)' },
  { label: 'HR', id: 'EMP007', pass: 'hr@1234', icon: BarChart2, color: '#c084fc', bg: 'rgba(192,132,252,0.15)' },
  { label: 'Admin', id: 'EMP001', pass: 'admin123', icon: Shield, color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
];

export default function Login() {
  const { login } = useAuth();
  const [id, setId] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!id.trim() || !pass.trim()) { setError('Please enter your Employee ID and password.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 380));
    const result = login(id.trim(), pass);
    if (!result.success) setError(result.error || 'Invalid credentials. Please try again.');
    setLoading(false);
  }

  function fillDemo(account) { setId(account.id); setPass(account.pass); setError(''); }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── LEFT: Spline 3D hero ─────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* Spline iframe — fills entire left panel */}
        <iframe
          src="https://my.spline.design/molang3dcopy-S3Rgo7qSnQYSuy1rFPR821hb/"
          frameBorder="0"
          title="Rev Workforce 3D Hero"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            pointerEvents: 'auto',
          }}
          allow="fullscreen"
          loading="eager"
        />

        {/* Soft gradient overlay — lets text stay legible */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.10) 60%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Logo + Branding — top-left */}
        <div style={{ position: 'absolute', top: 36, left: 40, display: 'flex', alignItems: 'center', gap: 13, zIndex: 2 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 13,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 24px rgba(79,70,229,0.45)',
          }}>
            <BarChart2 size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: '#fff', letterSpacing: -0.4, lineHeight: 1.1 }}>Rev Workforce</div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.65)', fontWeight: 400, letterSpacing: 0.3 }}>Human Resource Management System</div>
          </div>
        </div>

        {/* Hero copy — bottom-left */}
        <div style={{ position: 'absolute', bottom: 56, left: 40, right: 40, zIndex: 2 }}>
          <h1 style={{
            fontSize: 'clamp(28px, 3.2vw, 42px)',
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1.15,
            marginBottom: 12,
            letterSpacing: -1,
            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
          }}>
            Streamline your<br />
            <span style={{ background: 'linear-gradient(90deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              HR operations.
            </span>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.70)', lineHeight: 1.7, marginBottom: 24, maxWidth: 380 }}>
            A unified platform for leave management, performance reviews, and employee records — built for enterprise teams.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { label: 'Leave Management' },
              { label: 'Performance Reviews' },
              { label: 'HR Analytics' },
              { label: 'Role-Based Access' },
            ].map(f => (
              <span key={f.label} style={{
                padding: '6px 13px',
                borderRadius: 99,
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.20)',
                fontSize: 12,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(8px)',
                letterSpacing: 0.2,
              }}>
                {f.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login card ────────────────────────────────────── */}
      <div style={{
        width: 440,
        flexShrink: 0,
        background: '#fff',
        borderLeft: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 44px',
        overflowY: 'auto',
        boxShadow: '-12px 0 48px rgba(15,23,42,0.06)',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>

          {/* Card header */}
          <div style={{ marginBottom: 30 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 5, letterSpacing: -0.4 }}>Welcome back</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>Sign in with your Employee ID to continue</div>
          </div>

          {/* Quick Demo Buttons */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 9 }}>
              Quick Demo Access
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {DEMO_ACCOUNTS.map(acc => {
                const Icon = acc.icon;
                return (
                  <button key={acc.label} onClick={() => fillDemo(acc)}
                    style={{
                      padding: '10px 12px', borderRadius: 10,
                      border: `1.5px solid rgba(0,0,0,0.08)`,
                      background: acc.bg, cursor: 'pointer',
                      transition: 'all 0.18s',
                      display: 'flex', alignItems: 'center', gap: 9,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.border = `1.5px solid ${acc.color}`; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 4px 14px ${acc.color}30`; }}
                    onMouseLeave={e => { e.currentTarget.style.border = '1.5px solid rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <Icon size={15} color={acc.color} />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', letterSpacing: 0.2 }}>{acc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#e8edf2' }} />
            <span style={{ fontSize: 11.5, color: '#94a3b8', fontWeight: 500 }}>or enter credentials</span>
            <div style={{ flex: 1, height: 1, background: '#e8edf2' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 9, background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, fontWeight: 500 }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Employee ID</label>
              <input className="form-input" id="employee-id" placeholder="e.g. EMP003" value={id} onChange={e => setId(e.target.value)} autoComplete="username" />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" id="password" type={showPass ? 'text' : 'password'} placeholder="Enter your password"
                  value={pass} onChange={e => setPass(e.target.value)} autoComplete="current-password" style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" id="sign-in-btn" className="btn btn-primary"
              style={{ justifyContent: 'center', padding: '12px', fontSize: 14.5, marginTop: 4, borderRadius: 10, fontWeight: 700, width: '100%' }}
              disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Authenticating...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Credentials hint */}
          <div style={{ marginTop: 22, padding: '13px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e8edf2' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.8 }}>Demo Credentials</div>
            <div style={{ fontSize: 11.5, color: '#94a3b8', lineHeight: 2 }}>
              <span>Employee: </span><code style={{ background: '#e8edf2', padding: '1px 6px', borderRadius: 4, color: '#334155', fontSize: 11 }}>EMP003</code>
              <span style={{ margin: '0 6px' }}>·</span>
              <span>Manager: </span><code style={{ background: '#e8edf2', padding: '1px 6px', borderRadius: 4, color: '#334155', fontSize: 11 }}>EMP002</code>
              <span style={{ margin: '0 6px' }}>·</span>
              <span>HR: </span><code style={{ background: '#e8edf2', padding: '1px 6px', borderRadius: 4, color: '#334155', fontSize: 11 }}>EMP007</code>
              <span style={{ margin: '0 6px' }}>·</span>
              <span>Admin: </span><code style={{ background: '#e8edf2', padding: '1px 6px', borderRadius: 4, color: '#334155', fontSize: 11 }}>EMP001</code>
              <br />
              <span>Default pw: </span><code style={{ background: '#e8edf2', padding: '1px 6px', borderRadius: 4, color: '#334155', fontSize: 11 }}>password123</code>
              <span style={{ margin: '0 6px' }}>·</span>
              <span>Admin: </span><code style={{ background: '#e8edf2', padding: '1px 6px', borderRadius: 4, color: '#334155', fontSize: 11 }}>admin123</code>
              <span style={{ margin: '0 6px' }}>·</span>
              <span>HR: </span><code style={{ background: '#e8edf2', padding: '1px 6px', borderRadius: 4, color: '#334155', fontSize: 11 }}>hr@1234</code>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
