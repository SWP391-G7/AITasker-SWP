/**
 * Frontend module: Components/Dashboard/Expert/InvitationsPanel.jsx
 *
 * Vai trò: Component Invitations Panel: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { Send } from 'lucide-react'

// React component “Invitations Panel” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const InvitationsPanel = ({ invitations, onAccept, onDecline }) => (
  <div className="admin-panel-card expert-invitations-panel">
    <div className="panel-header">
      <h2 className="panel-title">New Invitations</h2>
      <span className="dispute-tag tag-review">{invitations?.length || 0} New</span>
    </div>

    <div className="panel-list">
      {invitations && invitations.length > 0 ? (
        invitations.map((item) => (
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
              {item.status === 'pending' || !item.status ? (
                <>
                  <button className="btn-approve" onClick={() => onAccept && onAccept(item.id)}>Accept</button>
                  <button className="btn-reject" onClick={() => onDecline && onDecline(item.id)}>Decline</button>
                </>
              ) : (
                <span className={`project-status ${item.status}`} style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px' }}>
                  {item.status}
                </span>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="empty-panel-list text-muted py-5 text-center" style={{ textAlign: 'center', width: '100%' }}>
          No new invitations.
        </div>
      )}
    </div>

    <span className="panel-link expert-invitations-link">View Past Invitations</span>
  </div>
)

export default InvitationsPanel

