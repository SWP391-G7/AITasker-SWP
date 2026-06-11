import { Clock, DollarSign, FileText, TrendingUp } from "lucide-react";

function ClientStats({
  totalSpent = "$24,500.00",
  activeProjects = 8,
  pendingProposals = 3,
}) {
  return (
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
          <div className="stat-value">{activeProjects}</div>
          <div className="stat-trend trend-neutral">
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
          <div className="stat-value">{pendingProposals}</div>
          <div className="stat-trend trend-neutral">
            <span>Waiting for your review</span>
          </div>
        </div>

        <div className="stat-icon-box">
          <Clock size={20} />
        </div>
      </div>
    </section>
  );
}

export default ClientStats;