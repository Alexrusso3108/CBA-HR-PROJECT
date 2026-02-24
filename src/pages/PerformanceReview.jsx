import { useState } from 'react';
import { Plus, Star, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import { getPerformanceReviews, submitPerformanceReview } from '../store/dataStore';

function StarRating({ value, onChange, max = 5 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-rating">
      {Array.from({ length: max }, (_, i) => i + 1).map(n => (
        <span key={n} className={`star ${n <= (hover || value) ? 'active' : ''}`}
          style={{ color: n <= (hover || value) ? '#f6ad55' : 'var(--text-muted)', fontSize: 22, cursor: onChange ? 'pointer' : 'default' }}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange && onChange(n)}>★</span>
      ))}
      {value > 0 && <span style={{ fontSize: 13, color: 'var(--text-3)', marginLeft: 6 }}>{value}/5</span>}
    </div>
  );
}

const YEAR = new Date().getFullYear();
const emptyForm = { deliverables: '', accomplishments: '', improvements: '', selfRating: 0, year: YEAR };

export default function PerformanceReview() {
  const { user, refreshNotifications } = useAuth();
  const [tab, setTab] = useState('current');
  const [showSubmit, setShowSubmit] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [alert, setAlert] = useState(null);

  const allReviews = getPerformanceReviews({ employeeId: user.id });
  const currentReview = allReviews.find(r => r.year === YEAR);
  const pastReviews = allReviews.filter(r => r.year !== YEAR).sort((a, b) => b.year - a.year);

  function showAlert(type, msg) { setAlert({ type, msg }); setTimeout(() => setAlert(null), 3500); }

  function openSubmit() {
    if (currentReview) setForm({ deliverables: currentReview.deliverables, accomplishments: currentReview.accomplishments, improvements: currentReview.improvements, selfRating: currentReview.selfRating, year: YEAR });
    else setForm(emptyForm);
    setFormError('');
    setShowSubmit(true);
  }

  function handleSubmit() {
    setFormError('');
    if (!form.deliverables.trim()) { setFormError('Please fill in key deliverables.'); return; }
    if (!form.accomplishments.trim()) { setFormError('Please describe your accomplishments.'); return; }
    if (!form.improvements.trim()) { setFormError('Please mention areas of improvement.'); return; }
    if (!form.selfRating) { setFormError('Please provide a self-rating.'); return; }
    submitPerformanceReview({ ...form, employeeId: user.id });
    refreshNotifications();
    setShowSubmit(false);
    setRefresh(r => r + 1);
    showAlert('success', 'Performance review submitted successfully!');
  }

  function ReviewCard({ review }) {
    return (
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>Performance Review {review.year}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Submitted: {review.submittedOn}</div>
          </div>
          <Badge status={review.status} />
        </div>

        <div className="grid-2" style={{ gap: 16, marginBottom: 16 }}>
          {[
            { label: 'Key Deliverables', value: review.deliverables },
            { label: 'Accomplishments', value: review.accomplishments },
            { label: 'Areas of Improvement', value: review.improvements },
          ].map(f => (
            <div key={f.label} style={{ padding: '14px 16px', background: 'var(--bg-surface)', borderRadius: 10 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{f.label}</div>
              <div style={{ fontSize: 13.5, color: 'var(--text-1)', lineHeight: 1.6 }}>{f.value}</div>
            </div>
          ))}
          <div style={{ padding: '14px 16px', background: 'var(--bg-surface)', borderRadius: 10 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Self Rating</div>
            <StarRating value={review.selfRating} max={5} />
          </div>
        </div>

        {review.managerFeedback && (
          <div style={{ padding: '16px 18px', background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-light)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={14} /> Manager Feedback
              {review.reviewedOn && <span style={{ fontWeight: 400, color: 'var(--text-3)', marginLeft: 4 }}>· {review.reviewedOn}</span>}
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--text-1)', lineHeight: 1.6, marginBottom: 10 }}>{review.managerFeedback}</div>
            {review.managerRating && (
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>Manager Rating</div>
                <StarRating value={review.managerRating} max={5} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <Layout title="Performance Review">
      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Performance Reviews</h1>
          <p>Track your annual performance and feedback</p>
        </div>
        <button className="btn btn-primary" onClick={openSubmit}>
          <FileText size={15} /> {currentReview ? 'Update Review' : 'Submit Review'}
        </button>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'current' ? 'active' : ''}`} onClick={() => setTab('current')}>Current Year ({YEAR})</button>
        <button className={`tab-btn ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>Past Reviews</button>
      </div>

      {tab === 'current' && (
        currentReview ? <ReviewCard review={currentReview} /> : (
          <div className="card">
            <div className="empty-state">
              <FileText size={40} color="#cbd5e1" />
              <h3>No review submitted yet</h3>
              <p>Submit your {YEAR} performance review to share your achievements with your manager.</p>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={openSubmit}>
                <Plus size={15} /> Submit Now
              </button>
            </div>
          </div>
        )
      )}

      {tab === 'history' && (
        pastReviews.length === 0 ? (
          <div className="empty-state card"><FileText size={40} color="#cbd5e1" /><p>No past reviews found</p></div>
        ) : (
          pastReviews.map(r => <ReviewCard key={r.id} review={r} />)
        )
      )}

      <Modal isOpen={showSubmit} onClose={() => setShowSubmit(false)} title={`Performance Review ${YEAR}`} size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowSubmit(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Submit Review</button>
          </>
        }
      >
        {formError && <div className="alert alert-error"><AlertCircle size={14} /> {formError}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Key Deliverables Achieved</label>
            <textarea className="form-textarea" rows={3} value={form.deliverables} onChange={e => setForm({ ...form, deliverables: e.target.value })} placeholder="List your major deliverables and projects completed this year..." />
          </div>
          <div className="form-group">
            <label className="form-label">Major Accomplishments</label>
            <textarea className="form-textarea" rows={3} value={form.accomplishments} onChange={e => setForm({ ...form, accomplishments: e.target.value })} placeholder="Highlight your biggest achievements and impact..." />
          </div>
          <div className="form-group">
            <label className="form-label">Areas of Improvement</label>
            <textarea className="form-textarea" rows={3} value={form.improvements} onChange={e => setForm({ ...form, improvements: e.target.value })} placeholder="Be honest about areas where you can grow..." />
          </div>
          <div className="form-group">
            <label className="form-label">Self-Assessment Rating</label>
            <StarRating value={form.selfRating} onChange={v => setForm({ ...form, selfRating: v })} max={5} />
            <div className="form-hint">1 = Needs Improvement · 3 = Meets Expectations · 5 = Exceptional</div>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
