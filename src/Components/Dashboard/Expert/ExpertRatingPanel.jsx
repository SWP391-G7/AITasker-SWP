import { Star } from 'lucide-react'

const ExpertRatingPanel = ({ rating = 0, projectCount = 0 }) => (
  <section className="admin-panel-card expert-rating-panel">
    <div className="stat-title">Expert Rating</div>
    <div className="expert-rating-score">
      <span className="stat-value">{Number(rating || 0).toFixed(1)}</span>
      <div>
        <div className="stat-trend expert-stars">
          {[...Array(5)].map((_, index) => (
            <Star key={index} size={14} fill="currentColor" />
          ))}
        </div>
        <div className="item-reason">
          {projectCount > 0
            ? `From ${projectCount} service${projectCount > 1 ? 's' : ''}`
            : 'No services published yet'}
        </div>
      </div>
    </div>
  </section>
)

export default ExpertRatingPanel
