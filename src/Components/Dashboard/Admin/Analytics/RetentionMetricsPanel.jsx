const RetentionMetricsPanel = ({ metrics }) => (
  <aside className="analytics-panel retention-panel">
    <h2>Retention Metrics</h2>

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

    <blockquote>
      "System Insight: Expert retention has improved by 4% since the new tiered payment system was introduced."
    </blockquote>
  </aside>
)

export default RetentionMetricsPanel
