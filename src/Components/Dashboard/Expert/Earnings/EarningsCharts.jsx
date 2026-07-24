import React from 'react';
import { ChevronDown } from 'lucide-react';

const EarningsCharts = ({ summary = {} }) => {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'];
  const values = [40, 65, 45, 80, 55, 90]; // Percentage heights for bars

  const grossText = summary?.gross || '$0.00';
  const feesText = summary?.fees || '$0.00';
  const netText = summary?.net || '$0.00';
  const nextPayoutText = summary?.nextPayout || 'N/A';

  return (
    <div className="earnings-middle-grid">
      {/* Monthly Income Chart */}
      <div className="income-chart-card">
        <div className="card-header-row">
          <h4 className="card-title">Monthly Income Overview</h4>
          <div className="chart-period-badge">
            Last 6 Months
            <ChevronDown size={14} />
          </div>
        </div>
        
        <div className="chart-placeholder">
          <div className="chart-y-axis">
            <span>$5K</span>
            <span>$2.5K</span>
            <span>$0</span>
          </div>
          
          <div className="chart-grid-line" style={{ bottom: '0%' }}></div>
          <div className="chart-grid-line" style={{ bottom: '50%' }}></div>
          <div className="chart-grid-line" style={{ bottom: '100%' }}></div>

          {months.map((month, idx) => (
            <div key={month} className="chart-bar-group">
              <div className="chart-bar" style={{ height: `${values[idx]}%` }}></div>
              <span className="chart-label">{month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="summary-card">
        <div className="card-header-row">
          <h4 className="card-title">Earnings Summary</h4>
        </div>
        
        <div className="summary-list">
          <div className="summary-item">
            <label>Gross Earnings</label>
            <span>{grossText}</span>
          </div>
          <div className="summary-item">
            <label>Service Fees (10%)</label>
            <span className="text-coral">{feesText}</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-item">
            <label>Net Earnings</label>
            <span className="text-mint">{netText}</span>
          </div>
          
          <div className="summary-footer">
            Next scheduled payout: {nextPayoutText}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsCharts;
