import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'

const PREVIEW_LIMIT = 5

const ModerationPanel = ({ moderations, onApprove, onReject }) => {
  const safeModerations = Array.isArray(moderations) ? moderations : []
  const previewModerations = safeModerations.slice(0, PREVIEW_LIMIT)
  const remainingCount = Math.max(safeModerations.length - PREVIEW_LIMIT, 0)
  const viewMoreLabel = remainingCount > 0 ? `View ${remainingCount} more` : 'View all'

  return (
    <div className="admin-panel-card">
      <div className="panel-header">
        <h2 className="panel-title">Pending Moderation</h2>
      </div>

      <div className="panel-list">
        {previewModerations.length > 0 ? (
          previewModerations.map((item) => (
            <div key={item.id} className="list-item-row">
              <div className="item-left">
                {item.avatar ? (
                  <img src={item.avatar} alt={item.target} className="item-avatar" />
                ) : (
                  <div className="item-icon-box">
                    <FileText size={18} />
                  </div>
                )}
                <div className="item-details">
                  <span className="item-name">{item.target}</span>
                  <span className="item-reason">
                    Reason: <span className="reason-highlight">{item.reason}</span>
                  </span>
                </div>
              </div>
              {/* <div className="item-actions">
                <button className="btn-reject" onClick={() => onReject(item.id)}>Reject</button>
                <button className="btn-approve" onClick={() => onApprove(item.id)}>Approve</button>
              </div> */}
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-muted small">No items pending moderation</div>
        )}
      </div>

      <Link to="/admin/moderation" className="moderation-view-more-link">
        {viewMoreLabel}
      </Link>
    </div>
  )
}

export default ModerationPanel
