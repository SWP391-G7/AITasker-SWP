import { Send } from 'lucide-react'

const InvitationsPanel = ({ invitations }) => (
  <div className="admin-panel-card expert-invitations-panel">
    <div className="panel-header">
      <h2 className="panel-title">New Invitations</h2>
      <span className="dispute-tag tag-review">{invitations.length} New</span>
    </div>

    <div className="panel-list">
      {invitations.map((item) => (
        <div key={item.id} className="list-item-row">
          <div className="item-left">
            <div className="item-icon-box">
              <Send size={18} />
            </div>
            <div className="item-details">
              <span className="item-name">{item.role}</span>
              <span className="item-reason">Budget: {item.budget} | Duration: {item.duration}</span>
            </div>
          </div>
          <div className="item-actions">
            <button className="btn-approve">Accept</button>
            <button className="btn-reject">Decline</button>
          </div>
        </div>
      ))}
    </div>

    <span className="panel-link expert-invitations-link">View Past Invitations</span>
  </div>
)

export default InvitationsPanel
