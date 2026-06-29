const FinancialPerformancePanel = ({
  totalValue = '$0.00',
  serviceCount = 0,
  avgPrice = '$0.00',
  priceRange = '$0 — $0',
  earningsBars = [],
}) => (
  <section className="chart-panel-card expert-performance-panel">
    <div className="expert-performance-header">
      <div>
        <div className="stat-title">Service Portfolio</div>
        <div className="stat-value">{totalValue}</div>
        <div className="stat-trend text-muted">
          <span>Total Value of Published Services</span>
        </div>
      </div>
    </div>

    <div className="expert-money-grid">
      <div className="admin-stat-card expert-money-card">
        <div className="stat-title">Services Published</div>
        <div className="item-name">{serviceCount}</div>
      </div>
      <div className="admin-stat-card expert-money-card">
        <div className="stat-title">Average Price</div>
        <div className="item-name">{avgPrice}</div>
      </div>
      <div className="admin-stat-card expert-money-card">
        <div className="stat-title">Price Range</div>
        <div className="item-name">{priceRange}</div>
      </div>
    </div>

    <div className="expert-performance-chart">
      <div className="stat-title" style={{ marginBottom: '1rem' }}>Services Created by Month</div>
      <div className="custom-bar-chart">
      {earningsBars.length > 0 ? (
        earningsBars.map((bar) => (
          <div key={bar.label} className="chart-bar-container">
            <div className={`chart-bar ${bar.highlighted ? 'highlighted' : ''}`} style={{ height: bar.height }}></div>
            <span className="chart-label">{bar.label}</span>
          </div>
        ))
      ) : (
        <div className="text-muted small text-center py-3">No services published yet.</div>
      )}
      </div>
    </div>
  </section>
)

export default FinancialPerformancePanel
