/**
 * Frontend module: Components/review/ReviewList.jsx
 *
 * Vai trò: Component Review List: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { Star, MessageSquare } from 'lucide-react';
import ReviewCard from './ReviewCard';

// React component “Review List” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
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
