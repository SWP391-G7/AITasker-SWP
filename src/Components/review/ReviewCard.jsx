/**
 * Frontend module: Components/review/ReviewCard.jsx
 *
 * Vai trò: Component Review Card: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { Star, User } from 'lucide-react';

// React component “Review Card” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const ReviewCard = ({ review }) => {
  const dateStr = review.created_at
    ? new Date(review.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : '';

  return (
    <div className="review-card">
      <div className="review-card-header">
        <div className="review-card-avatar">
          {review.creator_avatar ? (
            <img src={review.creator_avatar} alt={review.creator_name} />
          ) : (
            <User size={18} />
          )}
        </div>
        <div className="review-card-meta">
          <span className="review-card-name">{review.creator_name || 'Anonymous'}</span>
          <span className="review-card-date">{dateStr}</span>
        </div>
        {review.stars && (
          <div className="review-card-stars">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={14}
                fill={s <= review.stars ? '#fbbf24' : 'none'}
                color={s <= review.stars ? '#fbbf24' : '#475569'}
              />
            ))}
          </div>
        )}
      </div>
      {review.review && (
        <div className="review-card-content">
          <p>{review.review}</p>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
