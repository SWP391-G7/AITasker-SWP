/**
 * Frontend module: Components/Dashboard/Expert/ContractsPanel.jsx
 *
 * Vai trò: Component Contracts Panel: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { useNavigate } from 'react-router-dom'
import { Briefcase } from 'lucide-react'

// React component “Contracts Panel” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const ContractsPanel = ({ contracts }) => {
  const navigate = useNavigate()

  return (
    <div className="admin-panel-card expert-contracts-panel">
      <div className="panel-header">
        <h2 className="panel-title">Active Contracts</h2>
        <span
          className="panel-link"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/expert/projects')}
        >
          View All Projects
        </span>
      </div>

      <div className="expert-contract-table-head">
        <span>Project Name</span>
        <span>Client</span>
        <span>Milestones</span>
        <span>Next Deadline</span>
        <span>Action</span>
      </div>

      <div className="panel-list expert-contract-list">
        {contracts && contracts.length > 0 ? (
          contracts.map((item) => (
            <div key={item.id} className="list-item-row">
              <div className="item-left">
                <div className="item-icon-box">
                  <Briefcase size={18} />
                </div>
                <div className="item-details">
                  <span className="item-name">{item.name}</span>
                  <span className="item-reason">
                    {item.pricingType === 'hourly' ? 'Hourly rate' : 'Fixed price'} · {item.price || '$0.00'}
                  </span>
                </div>
              </div>
              <span className="item-name">{item.client}</span>
              <span className="item-reason">{item.progress}</span>
              <span className={`dispute-tag ${item.tagClass}`}>{item.deadline || 'Flexible'}</span>
              <button
                className="btn-case"
                onClick={() => item.id && navigate(`/projects/${item.id}`)}
                style={{ cursor: 'pointer' }}
              >
                Open
              </button>
            </div>
          ))
        ) : (
          <div className="empty-panel-list text-muted py-4 text-center w-100 d-flex flex-column align-items-center justify-content-center" style={{ textAlign: 'center', width: '100%', gridColumn: 'span 5', gap: '10px' }}>
            <span>No active contracts found.</span>
            <button
              className="btn btn-sm btn-primary fw-semibold px-3 py-1"
              style={{ fontSize: '0.8rem', borderRadius: '6px', cursor: 'pointer' }}
              onClick={() => navigate('/marketplace?target=jobs')}
            >
              Browse Jobs
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ContractsPanel
