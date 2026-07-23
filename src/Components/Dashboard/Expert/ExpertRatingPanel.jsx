import { Star } from 'lucide-react'

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
