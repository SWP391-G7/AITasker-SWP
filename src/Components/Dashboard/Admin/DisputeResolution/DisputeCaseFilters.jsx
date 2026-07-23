/**
 * Frontend module: Components/Dashboard/Admin/DisputeResolution/DisputeCaseFilters.jsx
 *
 * Vai trò: Component Dispute Case Filters: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
// React component “Dispute Case Filters” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const DisputeCaseFilters = ({ activeFilter, filters, onFilterChange }) => (
  <div className="dispute-section-heading">
    <h2>Recent Cases</h2>
    <div className="dispute-filter-tabs">
      {filters.map((filter) => (
        <button
          className={`dispute-filter-button ${activeFilter === filter ? 'active' : ''}`}
          key={filter}
          type="button"
          onClick={() => onFilterChange(filter)}
        >
          {filter}
        </button>
      ))}
    </div>
  </div>
)

export default DisputeCaseFilters
