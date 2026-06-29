const EarningsCharts = ({ summary, bars }) => {
  const chartBars = Array.isArray(bars) && bars.length > 0
    ? bars
    : [
        { label: 'JAN', value: '$0', height: '2%' },
        { label: 'FEB', value: '$0', height: '2%' },
        { label: 'MAR', value: '$0', height: '2%' },
        { label: 'APR', value: '$0', height: '2%' },
        { label: 'MAY', value: '$0', height: '2%' },
        { label: 'JUN', value: '$0', height: '2%' },
        { label: 'JUL', value: '$0', height: '2%' },
        { label: 'AUG', value: '$0', height: '2%' },
        { label: 'SEP', value: '$0', height: '2%' },
        { label: 'OCT', value: '$0', height: '2%' },
        { label: 'NOV', value: '$0', height: '2%' },
        { label: 'DEC', value: '$0', height: '2%' },
      ]

  return (
    <div className="earnings-middle-grid">
      <div className="income-chart-card">
        <div className="card-header-row">
          <h4 className="card-title">Monthly Income Overview</h4>
          <div className="chart-period-badge">
            This Year
          </div>
        </div>

        <div className="chart-placeholder">
          <div className="chart-y-axis">
            <span>&nbsp;</span>
            <span>&nbsp;</span>
            <span>&nbsp;</span>
          </div>

          {chartBars.map((bar) => (
            <div key={bar.label} className="chart-bar-group">
              <div className="chart-bar" style={{ height: bar.height }}></div>
              <span className="chart-label">{bar.label}</span>
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
            <span>{summary.gross}</span>
          </div>
          <div className="summary-item">
            <label>Service Fees (10%)</label>
            <span className="text-coral">{summary.fees}</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-item">
            <label>Net Earnings</label>
            <span className="text-mint">{summary.net}</span>
          </div>
          
          <div className="summary-footer">
            Next scheduled payout: {summary.nextPayout}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsCharts;
