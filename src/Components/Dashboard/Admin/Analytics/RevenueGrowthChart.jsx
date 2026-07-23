const RevenueGrowthChart = ({ bars, periodLabel }) => (
  <section className="analytics-panel revenue-panel">
    <div className="analytics-panel-header">
      <div>
        <h2>Revenue Growth</h2>
        <p>Monthly revenue breakdown per category</p>
      </div>
      <button type="button">Year {periodLabel || new Date().getFullYear()}</button>
    </div>

    <div className="analytics-bar-chart">
      {bars.map((bar) => (
        <div className="analytics-bar-column" key={bar.label}>
          <span
            className={`analytics-bar ${bar.active ? 'active' : ''} ${bar.amount > 0 ? 'has-value' : ''}`}
            style={{ height: `${bar.value}%` }}
            tabIndex={0}
            aria-label={`${bar.label} revenue: $${bar.amount.toLocaleString()}`}
          >
            <span className="analytics-bar-tooltip">
              {bar.label}: ${bar.amount.toLocaleString()}
            </span>
          </span>
          <small>{bar.label}</small>
        </div>
      ))}
    </div>
  </section>
)

export default RevenueGrowthChart
