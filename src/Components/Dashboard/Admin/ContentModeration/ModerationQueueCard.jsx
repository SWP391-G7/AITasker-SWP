import { CheckCircle2, XCircle } from 'lucide-react'

const ModerationQueueCard = ({ item }) => (
  <article className="moderation-card">
    <img src={item.image} alt="" className="moderation-card-image" />

    <div className="moderation-card-body">
      <div className="moderation-card-meta">
        <span className={`severity-badge severity-${item.severity}`}>{item.severityLabel}</span>
        <span className="moderation-time">{item.time}</span>
      </div>
      <h2 className="moderation-card-title">{item.title}</h2>
      <p className="moderation-card-description">{item.description}</p>
      <div className="moderation-tags">
        <span className="moderation-tag">Policy: {item.policy}</span>
        <span className="moderation-tag">Type: {item.type}</span>
      </div>
    </div>

    <div className="moderation-actions">
      <button className="moderation-action-button approve" type="button">
        <CheckCircle2 size={14} />
        Approve
      </button>
      <button className="moderation-action-button reject" type="button">
        <XCircle size={14} />
        Reject
      </button>
    </div>
  </article>
)

export default ModerationQueueCard
