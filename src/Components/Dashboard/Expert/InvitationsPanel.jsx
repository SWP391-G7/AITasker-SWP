import { Send } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const InvitationsPanel = ({ invitations }) => {
  const navigate = useNavigate()

  return (
    <div className="admin-panel-card expert-invitations-panel">
      <div className="panel-header">
        <h2 className="panel-title">New Invitations</h2>
        <span className="dispute-tag tag-review">{invitations.length} New</span>
      </div>

      <div className="panel-list">
        {invitations && invitations.length > 0 ? (
          invitations.map((item) => (
            <div
              key={item.id}
              className="list-item-row"
              onClick={() => item.id && navigate(`/marketplace/task/${item.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="item-left">
                <div className="item-icon-box">
                  <Send size={18} />
                </div>
                <div className="item-details">
                  <span className="item-name">{item.role}</span>
                  <span className="item-reason">Budget: {item.budget} | Duration: {item.duration}</span>
                </div>
              </div>
              <div className="item-actions" onClick={(e) => e.stopPropagation()}>
                <button className="btn-approve">Accept</button>
                <button className="btn-reject">Decline</button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-panel-list text-muted py-5 text-center" style={{ textAlign: 'center', width: '100%' }}>
            No new invitations.
          </div>
        )}
      </div>

      <span className="panel-link expert-invitations-link" onClick={() => navigate('/marketplace')} style={{ cursor: 'pointer' }}>View Past Invitations</span>
    </div>
  )
}

export default InvitationsPanel
