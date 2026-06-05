function SpendingChart() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
  const values = [20, 35, 55, 40, 70, 90]

  return (
    <section className="panel spending-panel">
      <div className="panel-header">
        <h2>Spending History</h2>
        <button>Last 6 Months</button>
      </div>

      <div className="chart-area">
        <div className="chart-lines">
          <span>$10k</span>
          <span>$7.5k</span>
          <span>$5k</span>
          <span>$2.5k</span>
          <span>$0</span>
        </div>

        <div className="bar-chart">
          {values.map((value, index) => (
            <div className="bar-item" key={months[index]}>
              <div className="bar" style={{ height: `${value}%` }}></div>
              <span>{months[index]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SpendingChart