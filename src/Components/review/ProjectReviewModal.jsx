/**
 * Frontend module: Components/review/ProjectReviewModal.jsx
 *
 * Vai trò: Modal Component cho phép Client và Expert đánh giá lẫn nhau sau khi hoàn thành dự án.
 * Hỗ trợ hiển thị số ngày còn lại trong thời hạn 14 ngày, chọn sao, nhập nhận xét và gửi về server.
 */
import { useState } from 'react';
import { Star, Send, Loader2, X, Clock, Award } from 'lucide-react';
import { submitProjectReview } from '../../Services/projectService';

const MODAL_OVERLAY = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.72)',
  backdropFilter: 'blur(6px)',
  display: 'flex',
  alignItems: 'center',
  justify: 'center',
  zIndex: 1100,
};

const MODAL_BOX = {
  background: 'linear-gradient(145deg, #0d1629 0%, #070c14 100%)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '20px',
  padding: '32px',
  width: '90%',
  maxWidth: '540px',
  boxShadow: '0 24px 60px rgba(0, 0, 0, 0.65)',
  color: '#fff',
  position: 'relative',
};

const inputSt = {
  width: '100%',
  padding: '14px 16px',
  background: 'rgba(0, 0, 0, 0.3)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '0.93rem',
  boxSizing: 'border-box',
  outline: 'none',
};

const btnGreen = {
  backgroundColor: '#10b981',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  padding: '12px 24px',
  fontWeight: '700',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '0.93rem',
  transition: 'all 0.2s ease',
};

const btnOutline = {
  background: 'transparent',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  color: 'rgba(255, 255, 255, 0.8)',
  borderRadius: '10px',
  padding: '12px 20px',
  fontWeight: '600',
  cursor: 'pointer',
  fontSize: '0.9rem',
};

export default function ProjectReviewModal({
  open,
  onClose,
  targetName = 'Partner',
  targetRole = 'Partner',
  projectId,
  targetId,
  daysRemaining = 14,
  onSubmitSuccess,
}) {
  const [stars, setStars] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (stars === 0) {
      setError('Please select a star rating.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      await submitProjectReview({
        target_id: targetId,
        project_id: projectId,
        stars,
        review: review.trim(),
      });
      setSubmitting(false);
      if (onSubmitSuccess) onSubmitSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit project review.');
      setSubmitting(false);
    }
  };

  return (
    <div style={MODAL_OVERLAY} onClick={onClose}>
      <div style={MODAL_BOX} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Award size={22} style={{ color: '#fbbf24' }} />
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '700', color: '#fff' }}>
                Leave a Project Review
              </h3>
            </div>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem' }}>
              Rate your experience working with <strong>{targetName}</strong> ({targetRole})
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* 14-day window notice */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(59, 130, 246, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.28)',
            borderRadius: '10px',
            padding: '10px 14px',
            color: '#93c5fd',
            fontSize: '0.82rem',
            marginBottom: '22px',
          }}
        >
          <Clock size={16} style={{ flexShrink: 0 }} />
          <span>
            Project reviews are open for <strong>{daysRemaining} more day{daysRemaining !== 1 ? 's' : ''}</strong> (14-day limit).
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Star selector */}
          <div style={{ marginBottom: '22px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                color: 'rgba(255,255,255,0.45)',
                fontWeight: '700',
                letterSpacing: '0.04em',
                marginBottom: '10px',
                textTransform: 'uppercase',
              }}
            >
              Rating *
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={32}
                  style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
                  fill={s <= (hoveredStar || stars) ? '#fbbf24' : 'none'}
                  color={s <= (hoveredStar || stars) ? '#fbbf24' : '#475569'}
                  onMouseEnter={() => setHoveredStar(s)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setStars(s)}
                />
              ))}
              <span style={{ marginLeft: '10px', fontWeight: '700', fontSize: '1rem', color: '#fbbf24' }}>
                {hoveredStar || stars} / 5
              </span>
            </div>
          </div>

          {/* Textarea */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label
                style={{
                  fontSize: '0.78rem',
                  color: 'rgba(255,255,255,0.45)',
                  fontWeight: '700',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Written Feedback
              </label>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
                {review.length}/1000
              </span>
            </div>
            <textarea
              style={{ ...inputSt, resize: 'vertical', minHeight: '110px' }}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder={`Share your experience working with ${targetName}. How was their communication, speed, and overall quality?`}
              rows={4}
              maxLength={1000}
            />
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#f87171',
                fontSize: '0.86rem',
                marginBottom: '18px',
              }}
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button type="button" style={btnOutline} onClick={onClose} disabled={submitting}>
              Remind Me Later
            </button>
            <button type="submit" style={btnGreen} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send size={16} /> Submit Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
