import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { getAnnouncements } from '../store/dataStore';

const PRIORITY_CONFIG = {
  high: { color: '#dc2626', bg: '#fff5f5', border: '#fecaca', label: 'Critical', icon: AlertTriangle },
  medium: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Important', icon: Info },
  low: { color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd', label: 'General', icon: Info },
};

export default function Announcements() {
  const announcements = getAnnouncements();
  const high = announcements.filter(a => a.priority === 'high');
  const others = announcements.filter(a => a.priority !== 'high');

  return (
    <Layout title="Announcements">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Company Announcements</h1>
          <p>Stay informed with the latest company news, policy updates, and notices</p>
        </div>
      </div>

      {high.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626' }} />
            Critical Notices
          </div>
          {high.map(a => <AnnCard key={a.id} a={a} />)}
        </div>
      )}

      {others.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 }}>
            Recent Announcements
          </div>
          {others.map(a => <AnnCard key={a.id} a={a} />)}
        </div>
      )}

      {announcements.length === 0 && (
        <div className="empty-state card">
          <CheckCircle size={40} color="#cbd5e1" />
          <h3>No announcements</h3>
          <p>Company-wide announcements and notices will appear here.</p>
        </div>
      )}
    </Layout>
  );
}

function AnnCard({ a }) {
  const cfg = PRIORITY_CONFIG[a.priority] || PRIORITY_CONFIG.low;
  const Icon = cfg.icon;
  return (
    <div style={{ padding: '18px 22px', background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 12, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: `${cfg.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
          <Icon size={17} color={cfg.color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 6 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{a.title}</div>
            <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: `${cfg.color}12`, padding: '3px 10px', borderRadius: 6, border: `1px solid ${cfg.border}`, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: 0.6 }}>
              {cfg.label}
            </span>
          </div>
          <div style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.7, marginBottom: 10 }}>{a.content}</div>
          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Posted on {a.date}</div>
        </div>
      </div>
    </div>
  );
}
