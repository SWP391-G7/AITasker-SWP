/**
 * Frontend module: Components/Dashboard/Admin/ContentModeration/ContentModerationStats.jsx
 *
 * Vai trò: Component Content Moderation Stats: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
// React component “Content Moderation Stats” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
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
