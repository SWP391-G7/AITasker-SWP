/**
 * Frontend module: Components/Dashboard/Admin/ContentModeration/ContentModerationFilters.jsx
 *
 * Vai trò: Component Content Moderation Filters: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
// React component “Content Moderation Filters” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const ContentModerationFilters = ({
  activeFilter,
  filters,
  onFilterChange,
  onSeverityChange,
  severityFilter,
  reviewStatusFilter,
  onReviewStatusChange
}) => (
  <section className="moderation-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
    <div className="moderation-filter-tabs">
      {filters.map((filter) => (
        <button
          className={`moderation-filter-button ${activeFilter === filter ? 'active' : ''}`}
          key={filter}
          type="button"
          onClick={() => onFilterChange(filter)}
        >
          {filter}
        </button>
      ))}
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
      <label className="moderation-severity-filter">
        <span>Status:</span>
        <select
          value={reviewStatusFilter}
          onChange={(event) => onReviewStatusChange(event.target.value)}
        >
          <option value="all">All</option>
          <option value="reviewed">Show Reviewed Items</option>
          <option value="unreviewed">Show Unreviewed Items</option>
        </select>
      </label>

      <label className="moderation-severity-filter">
        <span>Severity:</span>
        <select value={severityFilter} onChange={(event) => onSeverityChange(event.target.value)}>
          <option>All Levels</option>
          <option>High Severity</option>
          <option>Medium Severity</option>
          <option>Low Severity</option>
        </select>
      </label>
    </div>
  </section>
)

export default ContentModerationFilters
