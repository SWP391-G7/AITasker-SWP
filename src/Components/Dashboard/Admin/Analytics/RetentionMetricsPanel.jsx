const RetentionMetricsPanel = ({ metrics, insight }) => (
  <aside className="analytics-panel retention-panel">
    <h2>Engagement Metrics</h2>

    <div className="retention-list">
      {metrics.map((item) => (
        <div className="retention-item" key={item.label}>
          <div>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
          <div className={`retention-track tone-${item.tone}`}>
            <span style={{ width: `${item.progress}%` }}></span>
          </div>
        </div>
      ))}
    </div>

    {insight && <blockquote>System Insight: {insight}.</blockquote>}
  </aside>
)

export default RetentionMetricsPanel
