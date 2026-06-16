import AnalyticsHeader from './AnalyticsHeader'
import AnalyticsKpiGrid from './AnalyticsKpiGrid'
import { analyticsKpis, retentionMetrics, revenueBars, topExperts } from './analyticsData'
import RetentionMetricsPanel from './RetentionMetricsPanel'
import RevenueGrowthChart from './RevenueGrowthChart'
import TopExpertsTable from './TopExpertsTable'

const AnalyticsView = () => (
  <>
    <AnalyticsHeader />
    <AnalyticsKpiGrid items={analyticsKpis} />

    <section className="analytics-main-grid">
      <RevenueGrowthChart bars={revenueBars} />
      <RetentionMetricsPanel metrics={retentionMetrics} />
    </section>

    <TopExpertsTable experts={topExperts} />
  </>
)

export default AnalyticsView
