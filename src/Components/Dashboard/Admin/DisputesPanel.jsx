/**
 * Frontend module: Components/Dashboard/Admin/DisputesPanel.jsx
 *
 * Vai trò: Component Disputes Panel: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { Link } from 'react-router-dom'

// React component “Disputes Panel” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const DisputesPanel = ({ disputes, onSelectDispute }) => (
  <div className="admin-panel-card">
    <div className="panel-header">
      <h2 className="panel-title">Active Disputes</h2>
      <Link className="panel-link" to="/admin/disputes">View Board</Link>
    </div>

    <div className="panel-list">
      {Array.isArray(disputes) && disputes.length > 0 ? (
        disputes.map((item) => (
          <div key={item.id} className="list-item-row">
            <div className="item-left">
              <div className="item-details">
                <span className={`dispute-tag ${item.tagClass}`}>{item.tag}</span>
                <span className="item-name">{item.title} - {item.caseId}</span>
                <span className="item-reason text-muted">
                  Client: {item.client} | Expert: {item.expert}
                </span>
              </div>
            </div>
            <button className="btn-case align-self-center" onClick={() => onSelectDispute?.(item)}>
              View Case
            </button>
          </div>
        ))
      ) : (
        <div className="text-center py-4 text-muted small">No active disputes found</div>
      )}
    </div>
  </div>
)

export default DisputesPanel
