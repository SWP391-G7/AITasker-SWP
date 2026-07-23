import AnalyticsKpiGrid from './AnalyticsKpiGrid'
import RetentionMetricsPanel from './RetentionMetricsPanel'
import RevenueGrowthChart from './RevenueGrowthChart'
import TopExpertsTable from './TopExpertsTable'

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
