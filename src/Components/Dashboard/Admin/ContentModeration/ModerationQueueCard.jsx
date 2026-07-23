import { Link } from 'react-router-dom'
import { CheckCircle2, EyeOff, RefreshCcw, XCircle } from 'lucide-react'

const actionableStatuses = ['pending']
const publishedStatuses = ['approved', 'open']
const removedStatuses = ['removed', 'rejected']

const ModerationQueueCard = ({ item, onApprove, onReject, onUnpublish, onRepublish }) => {
  const normalizedStatus = String(item.status || 'pending').toLowerCase()
  const canModerate = actionableStatuses.includes(normalizedStatus)
  const canUnpublish = publishedStatuses.includes(normalizedStatus)
  const canRepublish = removedStatuses.includes(normalizedStatus)

  return (
    <article className="moderation-card">
      <img src={item.image} alt="" className="moderation-card-image" />

      <div className="moderation-card-body">
        <div className="moderation-card-meta">
          <span className={`severity-badge severity-${item.severity}`}>{item.severityLabel}</span>
          <span 
            style={{
              padding: '3px 8px',
              borderRadius: '12px',
              fontSize: '0.72rem',
              fontWeight: '700',
              marginLeft: '8px',
              textTransform: 'uppercase',
              backgroundColor: 
                item.status === 'approved' || item.status === 'open' ? 'rgba(16, 185, 129, 0.15)' : 
                item.status === 'removed' || item.status === 'rejected' ? 'rgba(239, 68, 68, 0.15)' : 
                'rgba(245, 158, 11, 0.15)',
              color: 
                item.status === 'approved' || item.status === 'open' ? '#10b981' : 
                item.status === 'removed' || item.status === 'rejected' ? '#ef4444' : 
                '#f59e0b',
              border: 
                item.status === 'approved' || item.status === 'open' ? '1px solid rgba(16, 185, 129, 0.25)' : 
                item.status === 'removed' || item.status === 'rejected' ? '1px solid rgba(239, 68, 68, 0.25)' : 
                '1px solid rgba(245, 158, 11, 0.25)'
            }}
          >
            {item.status || 'pending'}
          </span>
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
        {canModerate && (
          <>
            <button 
              className="moderation-action-button approve" 
              type="button"
              onClick={() => onApprove && onApprove(item.id)}
            >
              <CheckCircle2 size={14} />
              Approve
            </button>
            <button 
              className="moderation-action-button reject" 
              type="button"
              onClick={() => onReject && onReject(item.id)}
            >
              <XCircle size={14} />
              Reject
            </button>
          </>
        )}
        {canUnpublish && (
          <button
            className="moderation-action-button unpublish"
            type="button"
            onClick={() => onUnpublish && onUnpublish(item.id)}
          >
            <EyeOff size={14} />
            Unpublish
          </button>
        )}
        {canRepublish && (
          <button
            className="moderation-action-button approve"
            type="button"
            onClick={() => onRepublish && onRepublish(item.id)}
          >
            <RefreshCcw size={14} />
            Publish
          </button>
        )}
        <Link className="moderation-detail-link" to={item.detailPath}>
          View detail
        </Link>
      </div>
    </article>
  )
}

export default ModerationQueueCard
