import { FileText } from 'lucide-react'

const ModerationPanel = ({ moderations, onApprove, onReject }) => (
  <div className="admin-panel-card">
    <div className="panel-header">
      <h2 className="panel-title">Pending Moderation</h2>
      <span className="panel-link">View All Tasks</span>
    </div>

    <div className="panel-list">
      {moderations.length > 0 ? (
        moderations.map((item) => (
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
            <div className="item-actions">
              <button className="btn-reject" onClick={() => onReject(item.id)}>Reject</button>
              <button className="btn-approve" onClick={() => onApprove(item.id)}>Approve</button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-4 text-muted small">No items pending moderation</div>
      )}
    </div>
  </div>
)

export default ModerationPanel
