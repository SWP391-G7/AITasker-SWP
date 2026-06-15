import { Scale, ShieldAlert, TrendingUp, Users } from 'lucide-react'

const AdminStats = ({ moderationCount, disputeCount }) => (
  <section className="admin-stats-grid">
    <div className="admin-stat-card">
      <div>
        <div className="stat-title">Total Active Users</div>
        <div className="stat-value">12,842</div>
        <div className="stat-trend trend-up">
          <TrendingUp size={14} />
          <span>+4.2% from last week</span>
        </div>
      </div>
      <div className="stat-icon-box">
        <Users size={20} />
      </div>
    </div>

    <div className="admin-stat-card">
      <div>
        <div className="stat-title">Pending Moderation</div>
        <div className="stat-value">{moderationCount}</div>
        <div className="stat-trend text-muted">
          <span>Avg response time: 2.4h</span>
        </div>
      </div>
      <div className="stat-icon-box">
        <ShieldAlert size={20} />
      </div>
    </div>

    <div className="admin-stat-card">
      <div>
        <div className="stat-title">Open Disputes</div>
        <div className="stat-value">{disputeCount}</div>
        <div className="stat-trend text-muted">
          <span>8 resolved today</span>
        </div>
      </div>
      <div className="stat-icon-box">
        <Scale size={20} />
      </div>
    </div>
  </section>
)

export default AdminStats
