import { Briefcase } from 'lucide-react'

const ContractsPanel = ({ contracts }) => (
  <div className="admin-panel-card expert-contracts-panel">
    <div className="panel-header">
      <h2 className="panel-title">Active Contracts</h2>
      <span className="panel-link">View All Projects</span>
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
            <span className={`dispute-tag ${item.tagClass}`}>{item.deadline}</span>
            <button className="btn-case">Open</button>
          </div>
        ))
      ) : (
        <div className="empty-panel-list text-muted py-5 text-center w-100" style={{ textAlign: 'center', width: '100%', gridColumn: 'span 5' }}>
          No active contracts found.
        </div>
      )}
    </div>
  </div>
)

export default ContractsPanel
