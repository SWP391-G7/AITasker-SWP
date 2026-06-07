import { FolderKanban } from 'lucide-react'

const getStatusClass = (status) => {
  if (status === 'In Progress') return 'tag-review'
  if (status === 'Under Review') return 'tag-urgent'
  if (status === 'Completed') return 'tag-new'
  return 'tag-review'
}

const ClientProjectsPanel = ({ projects }) => (
  <div className="admin-panel-card">
    <div className="panel-header">
      <h2 className="panel-title">Active Projects</h2>
      <span className="panel-link">View All Projects</span>
    </div>

    <div className="panel-list">
      {projects.length > 0 ? (
        projects.map((item) => (
          <div key={item.id} className="list-item-row">
            <div className="item-left">
              <div className="item-icon-box">
                <FolderKanban size={18} />
              </div>

              <div className="item-details">
                <span className="item-name">{item.name}</span>
                <span className="item-reason text-muted">
                  {item.description}
                </span>
                <span className="item-reason text-muted">
                  Expert: {item.expert} | Budget: {item.budget}
                </span>
              </div>
            </div>

            <div className="item-actions">
              <span className={`dispute-tag ${getStatusClass(item.status)}`}>
                {item.status}
              </span>
              <button className="btn-case">View</button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-4 text-muted small">
          No projects found
        </div>
      )}
    </div>
  </div>
)

export default ClientProjectsPanel