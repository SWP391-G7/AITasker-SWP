import { BadgeDollarSign, BarChart3, CheckCircle2, Users } from 'lucide-react'

const iconByType = {
  revenue: BadgeDollarSign,
  completion: CheckCircle2,
  experts: Users,
  price: BarChart3,
}

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
