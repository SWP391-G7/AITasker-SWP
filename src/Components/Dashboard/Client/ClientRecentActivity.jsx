function ClientRecentActivity({ activities }) {
  return (
    <div className="client-panel recent-activity-panel">
      <h2>Recent Activity</h2>

      <div className="activity-timeline">
        {activities.map((item, index) => (
          <div className="activity-item" key={item.id}>
            <div className={`activity-dot ${index === 1 ? "success" : ""}`}></div>

            <div className="activity-content">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span>{item.time}</span>
            </div>
          </div>
        ))}
      </div>

      <button className="history-btn">View All History</button>
    </div>
  );
}

export default ClientRecentActivity;