const DisputeResolutionStats = ({ stats }) => (
  <section className="dispute-stats-grid">
    {stats.map((item) => (
      <article className="dispute-stat-card" key={item.label}>
        <span className="dispute-stat-label">{item.label}</span>
        <strong className={`dispute-stat-value ${item.tone || ''}`.trim()}>{item.value}</strong>
        <span className={`dispute-stat-note ${item.tone || ''}`.trim()}>{item.note}</span>
      </article>
    ))}
  </section>
)

export default DisputeResolutionStats
