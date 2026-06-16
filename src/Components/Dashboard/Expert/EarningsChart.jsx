const earningsBars = [
  { label: 'Jan', height: '40%' },
  { label: 'Feb', height: '32%' },
  { label: 'Mar', height: '48%' },
  { label: 'Apr', height: '52%' },
  { label: 'May', height: '60%' },
  { label: 'Jun', height: '74%' },
  { label: 'Jul', height: '88%', value: '$7.5k', highlighted: true }
]

const EarningsChart = () => (
  <div className="chart-panel-card">
    <div className="d-flex justify-content-between align-items-center mb-2">
      <div>
        <h2 className="panel-title mb-1">Monthly Earnings</h2>
        <p className="text-muted small mb-0">Revenue trend over the last 7 months</p>
      </div>
      <div className="chart-legend">
        <span className="legend-dot"></span>
        <span>Current Period</span>
      </div>
    </div>

    <div className="custom-bar-chart">
      {earningsBars.map((bar) => (
        <div key={bar.label} className="chart-bar-container">
          <div className={`chart-bar ${bar.highlighted ? 'highlighted' : ''}`} style={{ height: bar.height }}>
            {bar.value && <span className="chart-bar-value">{bar.value}</span>}
          </div>
          <span className="chart-label">{bar.label}</span>
        </div>
      ))}
    </div>
  </div>
)

export default EarningsChart
