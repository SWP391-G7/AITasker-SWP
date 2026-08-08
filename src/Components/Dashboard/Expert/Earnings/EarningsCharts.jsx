/**
 * Frontend module: Components/Dashboard/Expert/Earnings/EarningsCharts.jsx
 *
 * Vai trò: Component Earnings Charts: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import React from 'react';
import { ChevronDown } from 'lucide-react';

// React component “Earnings Charts” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const EarningsCharts = ({ summary = {}, monthlyChartData = [] }) => {
  // Use passed dynamic 6-month chart data or compute fallbacks
  const defaultMonths = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'];
  const hasData = Array.isArray(monthlyChartData) && monthlyChartData.length > 0;
  
  const chartItems = hasData ? monthlyChartData : defaultMonths.map((m, idx) => ({ month: m, amount: [400, 650, 450, 800, 550, 900][idx] }));
  const maxAmount = Math.max(...chartItems.map(item => item.amount || 0), 100);
  
  const formatYAxis = (val) => {
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${Math.round(val)}`;
  };

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
            <span>{formatYAxis(maxAmount)}</span>
            <span>{formatYAxis(maxAmount / 2)}</span>
            <span>$0</span>
          </div>
          
          <div className="chart-grid-line" style={{ bottom: '0%' }}></div>
          <div className="chart-grid-line" style={{ bottom: '50%' }}></div>
          <div className="chart-grid-line" style={{ bottom: '100%' }}></div>

          {chartItems.map((item) => {
            const heightPct = maxAmount > 0 ? Math.max(12, Math.min(100, (item.amount / maxAmount) * 100)) : 12;
            return (
              <div key={item.month} className="chart-bar-group" title={`${item.month}: $${Number(item.amount || 0).toFixed(2)}`}>
                <div className="chart-bar" style={{ height: `${heightPct}%` }}></div>
                <span className="chart-label">{item.month}</span>
              </div>
            );
          })}
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
