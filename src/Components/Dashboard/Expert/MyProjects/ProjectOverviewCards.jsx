import React from 'react';
import { Briefcase, DollarSign, Clock, TrendingUp } from 'lucide-react';

const ProjectOverviewCards = ({
  activeContracts = 12,
  totalRevenue = '$24,850',
  projectedRevenue = '$31,200',
  upcomingMilestones = '03',
}) => {
  return (
    <div className="expert-money-grid project-overview-cards">
      <div className="admin-stat-card expert-money-card">
        <div className="stat-header">
          <div className="stat-icon-box" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <Briefcase size={20} />
          </div>
          <span className="stat-trend trend-up">
            <TrendingUp size={12} />
            +2 from last month
          </span>
        </div>
        <div className="stat-content">
          <h3 className="stat-title">ACTIVE CONTRACTS</h3>
          {/* API data: counters can be supplied by MyProjectsPage from marketplace jobs. */}
          <p className="stat-value">{activeContracts}</p>
        </div>
      </div>

      <div className="admin-stat-card expert-money-card">
        <div className="stat-header">
          <div className="stat-icon-box" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <DollarSign size={20} />
          </div>
          <span className="stat-trend" style={{ color: '#94a3b8' }}>
            Projected: {projectedRevenue}
          </span>
        </div>
        <div className="stat-content">
          <h3 className="stat-title">TOTAL REVENUE EARNED</h3>
          <p className="stat-value">{totalRevenue}</p>
        </div>
      </div>

      <div className="admin-stat-card expert-money-card">
        <div className="stat-header">
          <div className="stat-icon-box" style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e' }}>
            <Clock size={20} />
          </div>
          <span className="stat-trend trend-down">
            Next deadline in 14 hours
          </span>
        </div>
        <div className="stat-content">
          <h3 className="stat-title">UPCOMING MILESTONES</h3>
          <p className="stat-value">{upcomingMilestones}</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverviewCards;
