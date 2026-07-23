/**
 * Frontend module: Components/Dashboard/Admin/DisputeResolution/DisputeCaseCard.jsx
 *
 * Vai trò: Component Dispute Case Card: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { Bot, Code2, Database, Scale, ShieldAlert } from 'lucide-react'

// React component “Dispute Case Card” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const DisputeCaseCard = ({ item, isSelected, onSelect, onResolve }) => {
  const isResolved = item.is_resolved || item.status?.startsWith('Resolved')
  const statusClass = isResolved
    ? 'status-resolved'
    : (item.status === 'Escalated' ? 'status-escalated' : 'status-review')

  const caseIdDisplay = String(item.id || '').length > 8 ? String(item.id).slice(0, 8) : item.id

  return (
    <article
      className={`dispute-case-card ${isSelected ? 'is-selected' : ''}`}
      onClick={onSelect}
      style={{ cursor: 'pointer', border: isSelected ? '2px solid #3b82f6' : undefined }}
    >
      <div className="dispute-case-icon tone-rose">
        <ShieldAlert size={18} />
      </div>

      <div className="dispute-case-body">
        <div className="dispute-case-topline">
          <div>
            <h3>{item.title || item.project_title || 'Project Dispute'}</h3>
            <span>Case ID: #{caseIdDisplay}</span>
          </div>
          <span className={`dispute-status ${statusClass}`}>{item.status || 'Under Review'}</span>
        </div>

        <div className="dispute-case-details">
          <span>Client: <strong>{item.client_name || item.client || 'Client'}</strong></span>
          <span>Expert: <strong>{item.expert_name || item.expert || 'Expert'}</strong></span>
          <span>Value: <strong className="case-value">{item.value || `$${parseFloat(item.project_total_amount || 0).toLocaleString()}`}</strong></span>
        </div>

        <div className="dispute-case-footer">
          <span>
            {item.type || 'Dispute'} • {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Active'}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onSelect()
              }}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              View Evidence
            </button>

            {!isResolved && (
              <button
                type="button"
                className="btn-approve"
                onClick={(e) => {
                  e.stopPropagation()
                  onResolve(item)
                }}
                style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Scale size={13} /> Resolve
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export default DisputeCaseCard
