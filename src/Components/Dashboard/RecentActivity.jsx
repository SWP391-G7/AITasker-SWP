function RecentActivity() {
  const activities = [
    {
      title: "Elena K. submitted milestone",
      description: "2 for review",
      time: "2 hours ago",
      type: "success",
    },
    {
      title: "Payment of $1,500 processed",
      description: "Successfully completed",
      time: "Yesterday",
      type: "success",
    },
    {
      title: "New proposal received",
      description: "From David Chen",
      time: "2 days ago",
      type: "normal",
    },
    {
      title: "Project moved to review",
      description: "Computer Vision for Defect Detection",
      time: "3 days ago",
      type: "normal",
    },
  ]

  return (
    <section className="panel activity-panel">
      <h2>Recent Activity</h2>

      <div className="activity-list">
        {activities.map((activity, index) => (
          <div className="activity-item" key={index}>
            <span className={`activity-dot ${activity.type}`}></span>

            <div>
              <h3>{activity.title}</h3>
              <p>{activity.description}</p>
              <small>{activity.time}</small>
            </div>
          </div>
        ))}
      </div>

      <button className="view-history-btn">View All History</button>
    </section>
  )
}

export default RecentActivity