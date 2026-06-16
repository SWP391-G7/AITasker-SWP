const ContentModerationStats = ({ stats }) => (
  <section className="moderation-stats-grid">
    {stats.map((item) => (
      <article className="moderation-stat-card" key={item.label}>
        <span className="moderation-stat-label">{item.label}</span>
        <span className={`moderation-stat-value ${item.tone || ''}`.trim()}>{item.value}</span>
        <span className={`moderation-stat-note ${item.tone === 'is-success' ? 'is-success' : ''}`.trim()}>
          {item.note}
        </span>
      </article>
    ))}
  </section>
)

export default ContentModerationStats
