/**
 * Frontend module: Components/Dashboard/Admin/Analytics/AnalyticsKpiGrid.jsx
 *
 * Vai trò: Component Analytics Kpi Grid: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { BadgeDollarSign, BarChart3, CheckCircle2, Users } from 'lucide-react'

const iconByType = {
  revenue: BadgeDollarSign,
  completion: CheckCircle2,
  experts: Users,
  price: BarChart3,
}

// React component “Analytics Kpi Grid” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const AnalyticsKpiGrid = ({ items }) => (
  <section className="analytics-kpi-grid">
    {items.map((item) => {
      const Icon = iconByType[item.icon] || BarChart3

      return (
        <article className="analytics-kpi-card" key={item.label}>
          <div className="analytics-kpi-topline">
            <span className="analytics-kpi-icon"><Icon size={16} /></span>
            <span className={`analytics-kpi-trend ${item.tone}`}>{item.trend}</span>
          </div>
          <span className="analytics-kpi-label">{item.label}</span>
          <strong>{item.value}</strong>
          <div className="analytics-progress-track">
            <span style={{ width: `${item.progress}%` }}></span>
          </div>
        </article>
      )
    })}
  </section>
)

export default AnalyticsKpiGrid
