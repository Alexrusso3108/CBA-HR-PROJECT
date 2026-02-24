import { useState } from 'react';
import { Star, MessageSquare, AlertCircle, Users, ChevronRight } from 'lucide-react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import Avatar from '../../components/Avatar';
import { useAuth } from '../../context/AuthContext';
import { getTeamMembers, getPerformanceReviews, getGoals, submitManagerReview } from '../../store/dataStore';

function StarRating({ value, onChange, max = 5 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-rating">
      {Array.from({ length: max }, (_, i) => i + 1).map(n => (
        <span key={n}
          style={{ fontSize: 22, cursor: onChange ? 'pointer' : 'default', color: n <= (hover || value) ? '#f6ad55' : 'var(--text-muted)' }}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange && onChange(n)}>★</span>
      ))}
      {value > 0 && <span style={{ fontSize: 13, color: 'var(--text-3)', marginLeft: 6 }}>{value}/5</span>}
    </div>
  );
}

export default function TeamPerformance() {
  const { user, refreshNotifications } = useAuth();
  const [selectedReview, setSelectedReview] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [formError, setFormError] = useState('');
  const [alert, setAlert] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [activeEmp, setActiveEmp] = useState(null);

  const team = getTeamMembers(user.id);
  const teamIds = team.map(e => e.id);
  const allReviews = getPerformanceReviews({ teamIds });
  const allGoals = getGoals({ teamIds });

  function showAlert(type, msg) { setAlert({ type, msg }); setTimeout(() => setAlert(null), 3500); }

  function openFeedback(review) {
    setSelectedReview(review);
    setFeedback(review.managerFeedback || '');
    setRating(review.managerRating || 0);
    setFormError('');
  }

  function handleSubmit() {
    if (!feedback.trim()) { setFormError('Please provide feedback.'); return; }
    if (!rating) { setFormError('Please provide a rating.'); return; }
    submitManagerReview(selectedReview.id, feedback, rating);
    refreshNotifications();
    setSelectedReview(null);
    setRefresh(r => r + 1);
    showAlert('success', 'Feedback submitted successfully!');
  }

  function getEmpGoals(empId) { return allGoals.filter(g => g.employeeId === empId); }
  function getEmpReviews(empId) { return allReviews.filter(r => r.employeeId === empId); }

  return (
    <Layout title="Team Performance">
      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Team Performance Reviews</h1>
          <p>Review and provide feedback on your team's performance</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {[
          { label: 'Team Members', val: team.length, color: '#6c63ff' },
          { label: 'Reviews Submitted', val: allReviews.length, color: '#38b2ac' },
          { label: 'Awaiting Feedback', val: allReviews.filter(r => r.status === 'submitted').length, color: '#f6ad55' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: `${s.color}18` }}>
              <Star size={20} color={s.color} />
            </div>
            <div><div className="stat-label">{s.label}</div><div className="stat-value">{s.val}</div></div>
          </div>
        ))}
      </div>

      {team.length === 0 ? (
        <div className="empty-state card"><Users size={40} color="#cbd5e1" /><h3>No direct reports</h3><p>You have no team members assigned to you.</p></div>
      ) : (
        team.map(emp => {
          const empReviews = getEmpReviews(emp.id);
          const empGoals = getEmpGoals(emp.id);
          const completedGoals = empGoals.filter(g => g.status === 'completed').length;
          const isExpanded = activeEmp === emp.id;

          return (
            <div key={emp.id} className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }} onClick={() => setActiveEmp(isExpanded ? null : emp.id)}>
                <Avatar name={emp.name} size="md" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>{emp.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{emp.id} · {emp.email}</div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#38b2ac' }}>{empReviews.length}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Reviews</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#38ef7d' }}>{completedGoals}/{empGoals.length}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Goals</div>
                  </div>
                  <ChevronRight size={16} color="var(--text-3)" style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'none' }} />
                </div>
              </div>

              {isExpanded && (
                <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                  {/* Goals Summary */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)', marginBottom: 12 }}>Goals Progress</div>
                    {empGoals.length === 0 ? (
                      <div style={{ fontSize: 13, color: 'var(--text-3)' }}>No goals set yet.</div>
                    ) : (
                      empGoals.map(g => (
                        <div key={g.id} style={{ marginBottom: 10, padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{g.description}</div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-light)' }}>{g.progress}%</span>
                          </div>
                          <div className="progress-bar"><div className="progress-fill" style={{ width: `${g.progress}%` }} /></div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 4 }}>Deadline: {g.deadline}</div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Reviews */}
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)', marginBottom: 12 }}>Performance Reviews</div>
                  {empReviews.length === 0 ? (
                    <div style={{ fontSize: 13, color: 'var(--text-3)' }}>No reviews submitted yet.</div>
                  ) : (
                    empReviews.map(r => (
                      <div key={r.id} style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: 10, marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>FY {r.year}</div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <Badge status={r.status} />
                            {r.status === 'submitted' && (
                              <button className="btn btn-primary btn-sm" onClick={() => openFeedback(r)}>
                                <MessageSquare size={12} /> Give Feedback
                              </button>
                            )}
                            {r.status === 'reviewed' && (
                              <button className="btn btn-secondary btn-sm" onClick={() => openFeedback(r)}>
                                Edit Feedback
                              </button>
                            )}
                          </div>
                        </div>
                        <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 4 }}><strong>Deliverables:</strong> {r.deliverables}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 4 }}><strong>Accomplishments:</strong> {r.accomplishments}</div>
                        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                          <div>
                            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3 }}>Self Rating</div>
                            <StarRating value={r.selfRating} max={5} />
                          </div>
                          {r.managerRating && (
                            <div>
                              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3 }}>Your Rating</div>
                              <StarRating value={r.managerRating} max={5} />
                            </div>
                          )}
                        </div>
                        {r.managerFeedback && (
                          <div style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(108,99,255,0.08)', borderRadius: 8, fontSize: 12.5, color: 'var(--text-2)' }}>
                            <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Your Feedback: </span>{r.managerFeedback}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })
      )}

      <Modal isOpen={!!selectedReview} onClose={() => setSelectedReview(null)} title="Submit Performance Feedback" size="md"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setSelectedReview(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Submit Feedback</button>
          </>
        }
      >
        {formError && <div className="alert alert-error"><AlertCircle size={14} /> {formError}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Detailed Feedback</label>
            <textarea className="form-textarea" rows={5} value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Provide constructive feedback on this employee's performance..." />
          </div>
          <div className="form-group">
            <label className="form-label">Performance Rating</label>
            <StarRating value={rating} onChange={setRating} max={5} />
            <div className="form-hint" style={{ marginTop: 6 }}>1 = Needs Improvement · 3 = Meets Expectations · 5 = Exceptional</div>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
