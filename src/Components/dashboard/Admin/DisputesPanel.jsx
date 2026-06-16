const DisputesPanel = ({ disputes, onSelectDispute }) => (
  <div className="admin-panel-card">
    <div className="panel-header">
      <h2 className="panel-title">Active Disputes</h2>
      <span className="panel-link">View Board</span>
    </div>

    <div className="panel-list">
      {disputes.length > 0 ? (
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
            <button className="btn-case align-self-center" onClick={() => onSelectDispute(item)}>
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
