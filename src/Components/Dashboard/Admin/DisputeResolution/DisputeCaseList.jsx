/**
 * Frontend module: Components/Dashboard/Admin/DisputeResolution/DisputeCaseList.jsx
 *
 * Vai trò: Component Dispute Case List: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import DisputeCaseCard from './DisputeCaseCard'

// React component “Dispute Case List” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const DisputeCaseList = ({ cases, selectedCaseId, onSelectCase, onResolveCase }) => (
  <div className="dispute-case-list">
    {cases.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
        No dispute cases found matching the current search / filter criteria.
      </div>
    ) : (
      cases.map((item) => (
        <DisputeCaseCard
          item={item}
          key={item.id}
          isSelected={selectedCaseId === item.id}
          onSelect={() => onSelectCase(item.id)}
          onResolve={() => onResolveCase(item)}
        />
      ))
    )}
  </div>
)

export default DisputeCaseList
