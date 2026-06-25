import AnalyticsKpiGrid from './AnalyticsKpiGrid'
import { analyticsKpis, retentionMetrics, revenueBars, topExperts } from './analyticsData'
import RetentionMetricsPanel from './RetentionMetricsPanel'
import RevenueGrowthChart from './RevenueGrowthChart'
import TopExpertsTable from './TopExpertsTable'

const AnalyticsView = ({ kpis = analyticsKpis, experts = topExperts }) => (
  <>
    <AnalyticsKpiGrid items={kpis} />

    <section className="analytics-main-grid">
      <RevenueGrowthChart bars={revenueBars} />
      <RetentionMetricsPanel metrics={retentionMetrics} />
    </section>

    <TopExpertsTable experts={experts} />
  </>
)

export default AnalyticsView
