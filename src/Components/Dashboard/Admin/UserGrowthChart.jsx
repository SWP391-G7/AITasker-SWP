const growthBars = [
  { label: 'Mon', height: '35%' },
  { label: 'Tue', height: '50%' },
  { label: 'Wed', height: '45%' },
  { label: 'Thu', height: '60%' },
  { label: 'Fri', height: '75%' },
  { label: 'Sat', height: '88%', value: '310', highlighted: true },
  { label: 'Sun', height: '30%' }
]

const UserGrowthChart = () => (
  <section className="chart-panel-card">
    <div className="d-flex justify-content-between align-items-center mb-2">
      <div>
        <h2 className="panel-title mb-1">New User Growth</h2>
        <p className="text-muted small mb-0">Daily registrations over the last 7 days</p>
      </div>
      <div className="chart-legend">
        <span className="legend-dot"></span>
        <span>Current Week</span>
      </div>
    </div>

    <div className="custom-bar-chart">
      {growthBars.map((bar) => (
        <div key={bar.label} className="chart-bar-container">
          <div className={`chart-bar ${bar.highlighted ? 'highlighted' : ''}`} style={{ height: bar.height }}>
            {bar.value && <span className="chart-bar-value">{bar.value}</span>}
          </div>
          <span className="chart-label">{bar.label}</span>
        </div>
      ))}
    </div>
  </section>
)

export default UserGrowthChart
