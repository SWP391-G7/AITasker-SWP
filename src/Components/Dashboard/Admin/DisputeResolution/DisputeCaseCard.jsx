import { Bot, Code2, Database, ShieldAlert } from 'lucide-react'

const iconByTone = {
  blue: Bot,
  slate: Code2,
  rose: ShieldAlert,
}

const DisputeCaseCard = ({ item }) => {
  const Icon = iconByTone[item.iconTone] || Database

  return (
    <article className="dispute-case-card">
      <div className={`dispute-case-icon tone-${item.iconTone}`}>
        <Icon size={18} />
      </div>

      <div className="dispute-case-body">
        <div className="dispute-case-topline">
          <div>
            <h3>{item.title}</h3>
            <span>Case ID: #{item.id.split('-')[1]}</span>
          </div>
          <span className={`dispute-status status-${item.statusTone}`}>{item.status}</span>
        </div>

        <div className="dispute-case-details">
          <span>Client: <strong>{item.client}</strong></span>
          <span>Expert: <strong>{item.expert}</strong></span>
          <span>Value: <strong className="case-value">{item.value}</strong></span>
        </div>

        <div className="dispute-case-footer">
          <span>{item.meta}</span>
          <button type="button">View Details</button>
        </div>
      </div>
    </article>
  )
}

export default DisputeCaseCard
