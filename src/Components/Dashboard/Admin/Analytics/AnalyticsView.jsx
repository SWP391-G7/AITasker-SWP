/**
 * Frontend module: Components/Dashboard/Admin/Analytics/AnalyticsView.jsx
 *
 * Vai trò: Component Analytics View: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import AnalyticsKpiGrid from './AnalyticsKpiGrid'
import RetentionMetricsPanel from './RetentionMetricsPanel'
import RevenueGrowthChart from './RevenueGrowthChart'
import TopExpertsTable from './TopExpertsTable'

// React component “Analytics View” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const AnalyticsView = ({
  kpis = [],
  revenueBars = [],
  engagementMetrics = [],
  experts = [],
  allExperts = [],
  period = {},
  definitions = {},
}) => (
  <>
    <AnalyticsKpiGrid items={kpis} />

    <section className="analytics-main-grid">
      <RevenueGrowthChart bars={revenueBars} periodLabel={period.to?.slice(0, 4)} />
      <RetentionMetricsPanel metrics={engagementMetrics} insight={definitions.engagement} />
    </section>

    <TopExpertsTable experts={experts} allExperts={allExperts} />
  </>
)

export default AnalyticsView
