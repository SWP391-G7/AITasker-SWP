function ActiveProjectsTable() {
  const projects = [
    {
      name: "NLP Sentiment Analysis Model",
      description: "Training a custom BERT model",
      expert: "Elena K.",
      status: "In Progress",
      budget: "$4,500",
    },
    {
      name: "Computer Vision for Defect Detection",
      description: "YOLOv8 implementation for manufacturing",
      expert: "Marcus R.",
      status: "Under Review",
      budget: "$8,200",
    },
    {
      name: "Predictive Maintenance Dashboard",
      description: "Time-series forecasting UI integration",
      expert: "Sarah L.",
      status: "Completed",
      budget: "$3,150",
    },
  ]

  return (
    <section className="panel projects-panel">
      <div className="panel-header">
        <h2>Active Projects</h2>
        <button>View All →</button>
      </div>

      <table className="projects-table">
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Expert</th>
            <th>Status</th>
            <th>Budget</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {projects.map((project) => (
            <tr key={project.name}>
              <td>
                <strong>{project.name}</strong>
                <p>{project.description}</p>
              </td>

              <td>{project.expert}</td>

              <td>
                <span className={`status ${project.status.toLowerCase().replace(" ", "-")}`}>
                  {project.status}
                </span>
              </td>

              <td>{project.budget}</td>

              <td>
                <button className="table-action-btn">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default ActiveProjectsTable