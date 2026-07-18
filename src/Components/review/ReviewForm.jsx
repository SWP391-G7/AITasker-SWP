import { useState } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';

const ReviewForm = ({ serviceId, onSubmit, submitting }) => {
  const [stars, setStars] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [review, setReview] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (stars === 0) {
      setError('Please select a star rating.');
      return;
    }
    setError('');

    try {
      await onSubmit({
        target_id: serviceId,
        stars,
        review: review.trim()
      });
      setStars(0);
      setReview('');
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
    }
  };

  return (
    <div className="review-form glass-card">
      <h4 className="review-form-title">Leave a Review for This Service</h4>

      <div className="review-form-stars">
        <span className="review-form-label">Rating</span>
        <div className="star-selector">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={28}
              className="star-selector-star"
              fill={s <= (hoveredStar || stars) ? '#fbbf24' : 'none'}
              color={s <= (hoveredStar || stars) ? '#fbbf24' : '#475569'}
              onMouseEnter={() => setHoveredStar(s)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setStars(s)}
            />
          ))}
        </div>
      </div>

      <div className="review-form-field">
        <span className="review-form-label">Your Review</span>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your experience working with this expert..."
          rows={4}
          maxLength={1000}
        />
        <span className="review-form-charcount">{review.length}/1000</span>
      </div>

      {error && <div className="review-form-error">{error}</div>}

      <div className="review-form-actions">
        <button
          type="button"
          className="review-form-submit-btn"
          onClick={handleSubmit}
          disabled={submitting}
        >
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
    </div>
  );
};

export default ReviewForm;
