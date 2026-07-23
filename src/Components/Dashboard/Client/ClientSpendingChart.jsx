/**
 * Frontend module: Components/Dashboard/Client/ClientSpendingChart.jsx
 *
 * Vai trò: Component Client Spending Chart: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

// React component “Client Spending Chart” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
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