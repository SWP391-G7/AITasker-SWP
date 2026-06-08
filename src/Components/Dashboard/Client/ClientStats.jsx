<<<<<<< HEAD
import { BriefcaseBusiness, CircleDollarSign, Send } from "lucide-react"
import StatCard from "./StatCard"

function ClientStats() {
  return (
    <section className="stats-grid">
      <StatCard
        icon={<CircleDollarSign size={22} />}
        title="Total Spent"
        value="$24,500.00"
        badge="+12.5%"
        badgeType="success"
      />

      <StatCard
        icon={<BriefcaseBusiness size={22} />}
        title="Active Projects"
        value="8"
        subtitle="/ 12 Total"
        badge="Active"
      />

      <StatCard
        icon={<Send size={22} />}
        title="Pending Proposals"
        value="3"
        badge="Action Needed"
        badgeType="danger"
      />
    </section>
  )
}

export default ClientStats
=======
import { Clock, DollarSign, FileText, TrendingUp } from 'lucide-react'

const ClientStats = ({ projectCount, proposalCount, totalSpent }) => (
  <section className="admin-stats-grid">
    <div className="admin-stat-card">
      <div>
        <div className="stat-title">Total Spent</div>
        <div className="stat-value">{totalSpent}</div>
        <div className="stat-trend trend-up">
          <TrendingUp size={14} />
          <span>+12.5% from last month</span>
        </div>
      </div>
      <div className="stat-icon-box">
        <DollarSign size={20} />
      </div>
    </div>

    <div className="admin-stat-card">
      <div>
        <div className="stat-title">Active Projects</div>
        <div className="stat-value">{projectCount}</div>
        <div className="stat-trend text-muted">
          <span>Projects currently running</span>
        </div>
      </div>
      <div className="stat-icon-box">
        <FileText size={20} />
      </div>
    </div>

    <div className="admin-stat-card">
      <div>
        <div className="stat-title">Pending Proposals</div>
        <div className="stat-value">{proposalCount}</div>
        <div className="stat-trend text-muted">
          <span>Waiting for your review</span>
        </div>
      </div>
      <div className="stat-icon-box">
        <Clock size={20} />
      </div>
    </div>
  </section>
)

export default ClientStats
>>>>>>> dashboard-admin
