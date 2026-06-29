import { Briefcase } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ContractsPanel = ({ contracts }) => {
  const navigate = useNavigate()

  return (
    <div className="admin-panel-card expert-contracts-panel">
      <div className="panel-header">
        <h2 className="panel-title">Published Services</h2>
        <span className="panel-link" onClick={() => navigate('/expert/projects')} style={{ cursor: 'pointer' }}>View All Services</span>
      </div>

      <div className="expert-contract-table-head">
        <span>Service Name</span>
        <span>Type</span>
        <span>Delivery</span>
        <span>Price</span>
      </div>

      <div className="panel-list expert-contract-list">
        {contracts && contracts.length > 0 ? (
          contracts.map((item) => (
            <div
              key={item.id}
              className="list-item-row"
              onClick={() => item.id && navigate(`/marketplace/service/${item.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="item-left">
                <div className="item-icon-box">
                  <Briefcase size={18} />
                </div>
                <div className="item-details">
                  <span className="item-name">{item.name}</span>
                </div>
              </div>
              <span className="item-reason">{item.pricingType === 'hourly' ? 'Hourly' : 'Fixed'}</span>
              <span className="item-reason">{item.progress}</span>
              <span className="item-name">{item.price}</span>
            </div>
          ))
        ) : (
          <div className="empty-panel-list text-muted py-5 text-center w-100">
            No services published yet.
          </div>
        )}
      </div>
    </div>
  )
}

export default ContractsPanel
