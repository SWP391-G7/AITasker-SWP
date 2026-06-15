import React from 'react';
import { Landmark, Lock, BarChart3 } from 'lucide-react';

const EarningsOverviewCards = ({ stats }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'bank': return <Landmark size={20} />;
      case 'lock': return <Lock size={20} />;
      case 'chart': return <BarChart3 size={20} />;
      default: return <Landmark size={20} />;
    }
  };

  return (
    <div className="earnings-stats-grid">
      {stats.map((stat) => (
        <div key={stat.id} className="earnings-stat-card">
          <div className="stat-top-info">
            <div className="stat-icon-wrapper">
              {getIcon(stat.icon)}
            </div>
            {stat.trend && (
              <span className={`stat-trend-badge ${stat.trendType === 'up' ? 'trend-up' : 'trend-neutral'}`}>
                {stat.trend}
              </span>
            )}
          </div>
          <h3>{stat.label}</h3>
          <p className="stat-value">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default EarningsOverviewCards;
