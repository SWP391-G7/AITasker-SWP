const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

function ClientSpendingChart() {
  return (
    <div className="client-panel spending-panel">
      <div className="client-panel-header">
        <h2>Spending History</h2>
        <button>Last 6 Months</button>
      </div>

      <div className="spending-chart">
        <div className="chart-y-labels">
          <span>$10k</span>
          <span>$7.5k</span>
          <span>$5k</span>
          <span>$2.5k</span>
          <span>$0</span>
        </div>

        <div className="chart-content">
          <div className="chart-empty-space"></div>

          <div className="chart-months">
            {months.map((month) => (
              <span key={month}>{month}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientSpendingChart;