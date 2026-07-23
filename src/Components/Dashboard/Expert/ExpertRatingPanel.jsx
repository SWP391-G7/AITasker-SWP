/**
 * Frontend module: Components/Dashboard/Expert/ExpertRatingPanel.jsx
 *
 * Vai trò: Component Expert Rating Panel: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { Star } from 'lucide-react'

// React component “Expert Rating Panel” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const ExpertRatingPanel = ({ rating = 5.0, projectCount = 342 }) => (
  <section className="admin-panel-card expert-rating-panel">
    <div className="stat-title">Expert Rating</div>
    <div className="expert-rating-score">
      {/* API data: rating comes from the expert profile response. */}
      <span className="stat-value">{Number(rating || 0).toFixed(1)}</span>
      <div>
        <div className="stat-trend expert-stars">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              size={14}
              fill={index < Math.round(Number(rating || 0)) ? "currentColor" : "none"}
              style={{ opacity: index < Math.round(Number(rating || 0)) ? 1 : 0.4 }}
            />
          ))}
        </div>
        <div className="item-reason">From {projectCount} successful projects</div>
      </div>
    </div>


  </section>
)

export default ExpertRatingPanel
