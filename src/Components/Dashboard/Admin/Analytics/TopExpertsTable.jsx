const TopExpertsTable = ({ experts }) => (
  <section className="analytics-experts-section">
    <div className="analytics-experts-heading">
      <h2>Top 5 Performing AI Experts</h2>
    </div>

    <div className="analytics-experts-table-wrap">
      <table className="analytics-experts-table">
        <thead>
          <tr>
            <th>Expert</th>
            <th>Specialization</th>
            <th>Completion</th>
            <th>Total Revenue</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {experts.map((expert) => (
            <tr key={expert.id}>
              <td>
                <div className="analytics-expert-cell">
                  {expert.avatar ? (
                    <img src={expert.avatar} alt={expert.name} />
                  ) : (
                    <span className="analytics-expert-avatar-fallback">
                      {expert.name.trim().charAt(0).toUpperCase() || 'E'}
                    </span>
                  )}
                  <strong>{expert.name}</strong>
                </div>
              </td>
              <td>{expert.specialization}</td>
              <td>{expert.completion}</td>
              <td className="analytics-revenue-cell">{expert.revenue}</td>
              <td>
                <span className="analytics-status-pill">{expert.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
)

export default TopExpertsTable
