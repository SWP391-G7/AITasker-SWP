/**
 * Frontend module: Components/Dashboard/Admin/DisputeResolution/DisputeResolutionStats.jsx
 *
 * Vai trò: Component Dispute Resolution Stats: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
// React component “Dispute Resolution Stats” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
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
