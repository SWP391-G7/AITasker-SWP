function StatCard({ icon, title, value, subtitle, badge, badgeType }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="stat-icon">{icon}</div>

        {badge && (
          <span className={`stat-badge ${badgeType || ""}`}>
            {badge}
          </span>
        )}
      </div>

      <p>{title}</p>

      <div className="stat-value-row">
        <h2>{value}</h2>
        {subtitle && <span>{subtitle}</span>}
      </div>
    </div>
  )
}

export default StatCard