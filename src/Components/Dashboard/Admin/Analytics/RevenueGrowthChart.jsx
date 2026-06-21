const RevenueGrowthChart = ({ bars }) => (
  <section className="analytics-panel revenue-panel">
    <div className="analytics-panel-header">
      <div>
        <h2>Revenue Growth</h2>
        <p>Monthly revenue breakdown per category</p>
      </div>
      <button type="button">Year 2024</button>
    </div>

    <div className="analytics-bar-chart">
      {bars.map((bar) => (
        <div className="analytics-bar-column" key={bar.label}>
          <span
            className={`analytics-bar ${bar.active ? 'active' : ''}`}
            style={{ height: `${bar.value}%` }}
          ></span>
          <small>{bar.label}</small>
        </div>
      ))}
    </div>
  </section>
)

export default RevenueGrowthChart
