/**
 * Frontend module: Components/Dashboard/Admin/Analytics/RetentionMetricsPanel.jsx
 *
 * Vai trò: Component Retention Metrics Panel: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
// React component “Retention Metrics Panel” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
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
