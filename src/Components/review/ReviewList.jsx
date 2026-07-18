import { Star, MessageSquare } from 'lucide-react';
import ReviewCard from './ReviewCard';

const ReviewList = ({ reviews = [], avgStars, totalReviews, loading }) => {
  if (loading) {
    return (
      <div className="reviews-section glass-card">
        <h3 className="section-header">Reviews</h3>
        <div className="reviews-loading">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className="reviews-section glass-card">
      <div className="reviews-header">
        <h3 className="section-header">Reviews</h3>
        {totalReviews > 0 && (
          <div className="reviews-summary">
            <div className="reviews-avg-stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  fill={s <= Math.round(avgStars || 0) ? '#fbbf24' : 'none'}
                  color={s <= Math.round(avgStars || 0) ? '#fbbf24' : '#475569'}
                />
              ))}
              <span className="reviews-avg-value">{avgStars ? avgStars.toFixed(1) : 'N/A'}</span>
            </div>
            <span className="reviews-count">
              <MessageSquare size={14} /> {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {totalReviews === 0 ? (
        <div className="reviews-empty">
          <MessageSquare size={32} className="reviews-empty-icon" />
          <p>No reviews yet.</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewList;
