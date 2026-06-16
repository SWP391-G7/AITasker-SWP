import { Star } from 'lucide-react'

const ExpertRatingPanel = () => (
  <section className="admin-panel-card expert-rating-panel">
    <div className="stat-title">Expert Rating</div>
    <div className="expert-rating-score">
      <span className="stat-value">5.0</span>
      <div>
        <div className="stat-trend expert-stars">
          {[...Array(5)].map((_, index) => (
            <Star key={index} size={14} fill="currentColor" />
          ))}
        </div>
        <div className="item-reason">From 342 successful projects</div>
      </div>
    </div>

    <div className="expert-kpi-list">
      <div className="expert-kpi-row">
        <span>Project Success Rate</span>
        <strong>100%</strong>
      </div>
      <div className="expert-progress"><span style={{ width: '100%' }}></span></div>
      <div className="expert-kpi-row">
        <span>On-time Delivery</span>
        <strong>98%</strong>
      </div>
      <div className="expert-progress"><span style={{ width: '98%' }}></span></div>
    </div>
  </section>
)

export default ExpertRatingPanel
