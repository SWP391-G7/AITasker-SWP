/**
 * Frontend module: Components/Dashboard/Expert/FinancialPerformancePanel.jsx
 *
 * Vai trò: Component Financial Performance Panel: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { Download } from 'lucide-react'

const earningsBars = [
  { label: 'Jan', height: '18%' },
  { label: 'Feb', height: '32%' },
  { label: 'Mar', height: '28%' },
  { label: 'Apr', height: '44%' },
  { label: 'May', height: '40%' },
  { label: 'Jun', height: '62%' },
  { label: 'Jul', height: '74%' },
  { label: 'Aug', height: '66%' },
  { label: 'Sep', height: '48%' },
  { label: 'Oct', height: '52%' },
  { label: 'Nov', height: '64%' },
  { label: 'Dec', height: '78%', highlighted: true }
]

// React component “Financial Performance Panel” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const FinancialPerformancePanel = ({
  totalLifetime = '$24,850.00',
  availableNow = '$8,240.00',
  pendingClearance = '$4,120.00',
  inEscrow = '$12,490.00',
}) => (
  <section className="chart-panel-card expert-performance-panel">
    <div className="expert-performance-header">
      <div>
        <div className="stat-title">Financial Performance</div>
        {/* API data: values can be supplied by dashboard page from service data. */}
        <div className="stat-value">{totalLifetime}</div>
        <div className="stat-trend text-muted">
          <span>Total Lifetime Earning</span>
        </div>
      </div>
      <div className="expert-performance-actions">
        <button className="icon-button" aria-label="Download report">
          <Download size={17} />
        </button>
        <button className="btn-approve">Withdraw Funds</button>
      </div>
    </div>

    <div className="expert-money-grid">
      <div className="admin-stat-card expert-money-card">
        <div className="stat-title">Available Now</div>
        <div className="item-name">{availableNow}</div>
      </div>
      <div className="admin-stat-card expert-money-card">
        <div className="stat-title">Pending Clearance</div>
        <div className="item-name">{pendingClearance}</div>
      </div>
      <div className="admin-stat-card expert-money-card">
        <div className="stat-title">In Escrow</div>
        <div className="item-name">{inEscrow}</div>
      </div>
    </div>

    <div className="custom-bar-chart expert-performance-chart">
      {earningsBars.map((bar) => (
        <div key={bar.label} className="chart-bar-container">
          <div className={`chart-bar ${bar.highlighted ? 'highlighted' : ''}`} style={{ height: bar.height }}></div>
          <span className="chart-label">{bar.label}</span>
        </div>
      ))}
    </div>
  </section>
)

export default FinancialPerformancePanel
