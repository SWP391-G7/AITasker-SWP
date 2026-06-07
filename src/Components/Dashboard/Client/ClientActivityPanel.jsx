const ClientActivityPanel = ({ activities }) => (
  <div className="admin-panel-card">
    <div className="panel-header">
      <h2 className="panel-title">Recent Activity</h2>
      <span className="panel-link">View History</span>
    </div>

    <div className="panel-list">
      {activities.length > 0 ? (
        activities.map((item) => (
          <div key={item.id} className="list-item-row">
            <div className="item-left">
              <div className="item-details">
                <span className={`dispute-tag ${item.tagClass}`}>
                  {item.tag}
                </span>
                <span className="item-name">{item.title}</span>
                <span className="item-reason text-muted">
                  {item.description}
                </span>
                <span className="item-reason text-muted">
                  {item.time}
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-4 text-muted small">
          No recent activity
        </div>
      )}
    </div>
  </div>
)

export default ClientActivityPanel