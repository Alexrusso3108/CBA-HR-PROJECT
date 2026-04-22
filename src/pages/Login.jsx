import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, BarChart2, ArrowRight } from 'lucide-react';

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
    if (!id.trim() || !pass.trim()) {
      setError('Please enter your Employee ID / Email and password.');
      return;
    }
    setLoading(true);
    const result = await login(id.trim(), pass);
    if (!result.success) setError(result.message || 'Invalid credentials. Please try again.');
    setLoading(false);
  }

  return (
    <div style={{
      display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden',
      background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif',
    }}>

      {/* ── LEFT: 3D / Brand hero ─────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* Spline 3D scene */}
        <iframe
          src="https://my.spline.design/3dpathsfactoryletterscopy-XthycEhd1WrvkY30bcKLoEpj/"
          frameBorder="0"
          title="Rev Workforce 3D Hero"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', pointerEvents: 'auto' }}
          allow="fullscreen"
          loading="eager"
        />

        {/* Hide Spline watermark badge */}
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: 220, height: 56,
          background: 'linear-gradient(135deg, #b8c4ce, #c9d3db)',
          zIndex: 10,
          pointerEvents: 'none',
          borderRadius: '8px 0 0 0',
        }} />

        {/* Dark overlay — strong enough for light Spline scenes */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(10,15,35,0.82) 0%, rgba(10,15,35,0.55) 50%, rgba(10,15,35,0.18) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
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

        {/* Hero copy */}
        <div style={{ position: 'absolute', bottom: 56, left: 40, right: 40, zIndex: 2 }}>
          {/* Extra backdrop blur behind text */}
          <div style={{
            position: 'absolute', inset: '-24px -20px',
            background: 'linear-gradient(to top, rgba(8,12,30,0.75) 0%, rgba(8,12,30,0.30) 70%, transparent 100%)',
            borderRadius: 16, zIndex: -1, pointerEvents: 'none',
          }} />
          <h1 style={{
            fontSize: 'clamp(28px, 3.2vw, 42px)', fontWeight: 900, color: '#fff',
            lineHeight: 1.15, marginBottom: 12, letterSpacing: -1,
            textShadow: '0 2px 24px rgba(0,0,0,0.8)',
          }}>
            Streamline your<br />
            <span style={{ background: 'linear-gradient(90deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 2px 8px rgba(129,140,248,0.6))' }}>
              HR operations.
            </span>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.90)', lineHeight: 1.7, marginBottom: 24, maxWidth: 380, textShadow: '0 1px 8px rgba(0,0,0,0.7)' }}>
            A unified platform for leave management, performance reviews, and employee records — built for enterprise teams.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Leave Management', 'Performance Reviews', 'HR Analytics', 'Role-Based Access'].map((f) => (
              <span key={f} style={{
                padding: '6px 13px', borderRadius: 99,
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.30)',
                fontSize: 12, fontWeight: 600, color: '#fff',
                backdropFilter: 'blur(12px)', letterSpacing: 0.2,
                textShadow: '0 1px 4px rgba(0,0,0,0.5)',
              }}>
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login form ─────────────────────────────────── */}
      <div style={{
        width: 440, flexShrink: 0, background: '#fff',
        borderLeft: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 44px', overflowY: 'auto',
        boxShadow: '-12px 0 48px rgba(15,23,42,0.06)',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>

          <div style={{ marginBottom: 30 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 5, letterSpacing: -0.4 }}>
              Welcome back
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Sign in with your Employee ID or email to continue.
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

            <div className="form-group">
              <label className="form-label">Employee ID or Email</label>
              <input
                className="form-input"
                id="employee-id"
                placeholder="e.g. EMP001 or john@acme.com"
                value={id}
                onChange={(e) => setId(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="sign-in-btn"
              className="btn btn-primary"
              style={{ justifyContent: 'center', padding: '12px', fontSize: 14.5, marginTop: 4, borderRadius: 10, fontWeight: 700, width: '100%', display: 'flex', alignItems: 'center', gap: 8 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Authenticating...
                </>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#64748b' }}>
            New company?{' '}
            <Link to="/register" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
              Register here
            </Link>
          </div>

          <div style={{ marginTop: 20, padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e8edf2' }}>
            <div style={{ fontSize: 11.5, color: '#94a3b8', lineHeight: 1.6 }}>
              💡 <strong>First time?</strong> Ask your admin for your Employee ID and temporary password. Admins can register their company at <span style={{ color: '#4f46e5' }}>/register</span>.
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
