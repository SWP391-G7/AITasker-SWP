import { Briefcase, Star, TrendingUp, Wallet } from 'lucide-react'

const ExpertStats = ({ contractCount }) => (
  <section className="admin-stats-grid">
    <div className="admin-stat-card">
      <div>
        <div className="stat-title">Lifetime Earnings</div>
        <div className="stat-value">$24,850</div>
        <div className="stat-trend trend-up">
          <TrendingUp size={14} />
          <span>+12.4% this month</span>
        </div>
      </div>
      <div className="stat-icon-box">
        <Wallet size={20} />
      </div>
    </div>

    <div className="admin-stat-card">
      <div>
        <div className="stat-title">Active Contracts</div>
        <div className="stat-value">{contractCount}</div>
        <div className="stat-trend text-muted">
          <span>2 milestones due soon</span>
        </div>
      </div>
      <div className="stat-icon-box">
        <Briefcase size={20} />
      </div>
    </div>

    <div className="admin-stat-card">
      <div>
        <div className="stat-title">Expert Rating</div>
        <div className="stat-value">5.0</div>
        <div className="stat-trend expert-stars">
          {[...Array(5)].map((_, index) => (
            <Star key={index} size={14} fill="currentColor" />
          ))}
        </div>
      </div>
      <div className="stat-icon-box">
        <Star size={20} />
      </div>
    </div>
  </section>
)

export default ExpertStats
